/**
 * Pizza Mania - Advanced Interactive Order System & Dynamic Pizza Builder
 * Handles Cart, Discounts, Order Tracking, Menu Search/Filtering, and Custom Pizza Customizer
 */

(function ($) {
  'use strict';

  // Cart State & Applied Discount
  let cart = JSON.parse(localStorage.getItem('pizza_mania_cart')) || [];
  let discountAmount = 0;
  let activeCoupon = '';

  // Helper: Format Price in INR
  function formatINR(amount) {
    return '₹' + Math.max(0, Math.round(amount)).toLocaleString('en-IN');
  }

  // Save Cart to LocalStorage
  function saveCart() {
    localStorage.setItem('pizza_mania_cart', JSON.stringify(cart));
    updateCartUI();
  }

  // Update Cart Badges & UI Elements
  function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    $('.cart-count-badge').text(totalCount);

    if (totalCount > 0) {
      $('.cart-count-badge').removeClass('d-none').addClass('d-inline-block');
      $('#floating-cart-btn .badge-counter').text(totalCount).show();
    } else {
      $('.cart-count-badge').addClass('d-none').removeClass('d-inline-block');
      $('#floating-cart-btn .badge-counter').hide();
    }

    renderCartItems();
  }

  // Show Toast Notification
  function showToast(message, type = 'success') {
    let toast = $('#cart-toast');
    if (toast.length === 0) {
      $('body').append(`
        <div id="cart-toast" style="position: fixed; bottom: 90px; right: 25px; z-index: 10000; background: #1a1a1a; color: #fff; padding: 14px 22px; border-radius: 50px; font-weight: 600; box-shadow: 0 12px 30px rgba(0,0,0,0.6); display: none; align-items: center; gap: 12px; font-family: 'Poppins', sans-serif; border: 1px solid rgba(250, 197, 100, 0.4); backdrop-filter: blur(10px);">
          <span class="toast-icon" style="font-size: 22px;">🍕</span> 
          <span id="cart-toast-msg" style="font-size: 14px; color: #fff;"></span>
        </div>
      `);
      toast = $('#cart-toast');
    }
    
    const icon = type === 'success' ? '🍕' : (type === 'coupon' ? '🏷️' : '✨');
    toast.find('.toast-icon').text(icon);
    $('#cart-toast-msg').text(message);
    toast.stop(true, true).css({ display: 'flex', opacity: 0, bottom: '80px' })
         .animate({ opacity: 1, bottom: '95px' }, 300)
         .delay(2800)
         .animate({ opacity: 0, bottom: '80px' }, 300, function() {
            $(this).hide();
         });
  }

  // Add Item to Cart
  function addToCart(title, priceStr, imageSrc, customDetails = '') {
    let price = 249;
    if (typeof priceStr === 'number') {
      price = priceStr;
    } else if (typeof priceStr === 'string') {
      const match = priceStr.match(/\d+/);
      if (match) price = parseInt(match[0], 10);
    }

    const itemKey = title + (customDetails ? ' (' + customDetails + ')' : '');
    const existingIndex = cart.findIndex(item => item.itemKey === itemKey);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        itemKey: itemKey,
        title: title,
        customDetails: customDetails,
        price: price,
        image: imageSrc || 'images/pizza-1.jpg',
        quantity: 1
      });
    }

    saveCart();
    showToast(`Added ${title} (${formatINR(price)}) to your cart!`);
  }

  // Render Cart Modal Content
  function renderCartItems() {
    const container = $('#cart-items-list');
    if (container.length === 0) return;

    if (cart.length === 0) {
      container.html(`
        <div class="text-center py-5">
          <div style="font-size: 60px; filter: drop-shadow(0 0 10px rgba(250,197,100,0.3));" class="mb-3">🍕</div>
          <h5 class="text-white font-weight-bold mb-2">Your Cart is Empty</h5>
          <p class="text-muted small">Explore our delicious wood-fired pizzas or craft your custom pizza!</p>
          <button class="btn btn-outline-warning btn-sm mt-2" data-dismiss="modal" style="border-radius: 20px;">Browse Menu</button>
        </div>
      `);
      $('#cart-subtotal').text(formatINR(0));
      $('#cart-discount-row').hide();
      $('#cart-tax').text(formatINR(0));
      $('#cart-delivery').text(formatINR(0));
      $('#cart-total').text(formatINR(0));
      $('#btn-checkout').prop('disabled', true).addClass('disabled');
      return;
    }

    let subtotal = 0;
    let html = '';

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      html += `
        <div class="cart-item d-flex align-items-center justify-content-between p-3 mb-2" style="background: rgba(255,255,255,0.04); border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s ease;">
          <div class="d-flex align-items-center" style="gap: 14px; max-width: 65%;">
            <img src="${item.image}" alt="${item.title}" style="width: 52px; height: 52px; object-fit: cover; border-radius: 10px; border: 1px solid rgba(250,197,100,0.3);">
            <div>
              <h6 class="mb-0 text-white font-weight-bold" style="font-size: 14px; line-height: 1.2;">${item.title}</h6>
              ${item.customDetails ? `<small class="text-warning d-block" style="font-size: 11px;">${item.customDetails}</small>` : ''}
              <span style="color: #fac564; font-weight: 600; font-size: 13px;">${formatINR(item.price)}</span>
            </div>
          </div>
          <div class="d-flex align-items-center" style="gap: 10px;">
            <div class="btn-group btn-group-sm" role="group" style="background: rgba(0,0,0,0.5); border-radius: 20px; padding: 2px; border: 1px solid rgba(255,255,255,0.1);">
              <button class="btn btn-sm text-white btn-decrease px-2 py-0" data-index="${index}" style="font-size: 14px; font-weight: bold;">-</button>
              <span class="px-2 text-white font-weight-bold align-self-center" style="font-size: 13px;">${item.quantity}</span>
              <button class="btn btn-sm text-white btn-increase px-2 py-0" data-index="${index}" style="font-size: 14px; font-weight: bold;">+</button>
            </div>
            <button class="btn btn-sm text-danger btn-remove p-1" data-index="${index}" style="background: transparent; border: none; font-size: 18px; line-height: 1;" title="Remove Item">&times;</button>
          </div>
        </div>
      `;
    });

    // Calculate discount
    if (activeCoupon === 'PIZZA100') {
      discountAmount = Math.min(100, subtotal);
    } else if (activeCoupon === 'CRUNCH20') {
      discountAmount = Math.round(subtotal * 0.20);
    } else {
      discountAmount = 0;
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const tax = Math.round(discountedSubtotal * 0.05); // 5% GST
    const delivery = subtotal > 499 || subtotal === 0 ? 0 : 49;
    const total = discountedSubtotal + tax + delivery;

    container.html(html);
    $('#cart-subtotal').text(formatINR(subtotal));

    if (discountAmount > 0) {
      $('#cart-discount-val').text('-' + formatINR(discountAmount));
      $('#cart-discount-row').show();
    } else {
      $('#cart-discount-row').hide();
    }

    $('#cart-tax').text(formatINR(tax));
    $('#cart-delivery').html(delivery === 0 ? '<span class="badge badge-success" style="background:#28a745;">FREE</span>' : formatINR(delivery));
    $('#cart-total').text(formatINR(total));
    $('#btn-checkout').prop('disabled', false).removeClass('disabled');
  }

  // Inject Dynamic Modals & Floating Cart Button
  function injectCartUI() {
    if ($('#cartModal').length === 0) {
      $('body').append(`
        <!-- Cart Drawer / Modal -->
        <div class="modal fade" id="cartModal" tabindex="-1" role="dialog" aria-labelledby="cartModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content" style="background: #121212; color: #fff; border: 1px solid rgba(250, 197, 100, 0.3); border-radius: 18px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.9);">
              <div class="modal-header d-flex align-items-center" style="border-bottom: 1px solid rgba(255,255,255,0.08); padding: 18px 24px; background: #1a1a1a;">
                <h5 class="modal-title d-flex align-items-center mb-0" id="cartModalLabel" style="color: #fac564; font-weight: 700; font-size: 18px;">
                  <span class="flaticon-pizza-1 mr-2" style="font-size: 24px;"></span> Your Cart & Order Summary
                </h5>
                <button type="button" class="close text-white opacity-75" data-dismiss="modal" aria-label="Close" style="font-size: 28px;">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body p-4" style="max-height: 52vh; overflow-y: auto;">
                <div id="cart-items-list"></div>
                
                <!-- Coupon Code Section -->
                <div class="coupon-section mt-3 p-3" style="background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed rgba(250,197,100,0.3);">
                  <label class="small text-muted mb-2 font-weight-bold d-block">🏷️ Have a Discount Coupon?</label>
                  <div class="input-group">
                    <input type="text" id="coupon-input" class="form-control form-control-sm bg-dark text-white border-secondary" placeholder="Try PIZZA100 or CRUNCH20" style="text-transform: uppercase;">
                    <div class="input-group-append">
                      <button class="btn btn-warning btn-sm font-weight-bold" id="btn-apply-coupon" type="button" style="background: #fac564; color: #000; border: none;">Apply</button>
                    </div>
                  </div>
                  <div id="coupon-feedback" class="small mt-1" style="display:none;"></div>
                </div>
              </div>
              
              <div class="modal-footer d-block" style="border-top: 1px solid rgba(255,255,255,0.08); background: #0b0b0b; padding: 18px 24px;">
                <div class="row mb-2" style="font-size: 13px; color: #bbb;">
                  <div class="col-6">Subtotal:</div>
                  <div class="col-6 text-right font-weight-bold text-white" id="cart-subtotal">₹0</div>
                  
                  <div class="col-6" id="cart-discount-row" style="display:none; color: #28a745;">Coupon Savings:</div>
                  <div class="col-6 text-right font-weight-bold" style="color: #28a745; display:none;" id="cart-discount-row-val"><span id="cart-discount-val">-₹0</span></div>
                  
                  <div class="col-6 mt-1">GST (5%):</div>
                  <div class="col-6 text-right font-weight-bold text-white mt-1" id="cart-tax">₹0</div>
                  <div class="col-6 mt-1">Delivery Fee:</div>
                  <div class="col-6 text-right font-weight-bold mt-1" id="cart-delivery" style="color: #fac564;">FREE</div>
                  <div class="col-6 mt-2 font-weight-bold text-white" style="font-size: 16px;">Total Payable:</div>
                  <div class="col-6 mt-2 text-right font-weight-bold" id="cart-total" style="font-size: 20px; color: #fac564;">₹0</div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-3" style="gap: 12px;">
                  <button type="button" class="btn btn-outline-light py-2 px-3 small" data-dismiss="modal" style="border-radius: 25px; border-color: rgba(255,255,255,0.2); font-size: 13px;">Continue Shopping</button>
                  <button type="button" class="btn btn-primary py-2 px-4" id="btn-checkout" style="border-radius: 25px; font-weight: 600; background: #fac564; color: #000; border: none; font-size: 14px;">Proceed to Checkout &rarr;</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Checkout Form Modal -->
        <div class="modal fade" id="checkoutModal" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content" style="background: #121212; color: #fff; border: 1px solid rgba(250, 197, 100, 0.4); border-radius: 18px; box-shadow: 0 25px 60px rgba(0,0,0,0.9);">
              <div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.08); background: #1a1a1a;">
                <h5 class="modal-title" style="color: #fac564; font-weight: 700; font-size: 18px;">🚚 Delivery Information</h5>
                <button type="button" class="close text-white" data-dismiss="modal">&times;</button>
              </div>
              <div class="modal-body p-4">
                <form id="orderForm">
                  <div class="form-group mb-3">
                    <label class="small text-muted mb-1">Full Name</label>
                    <input type="text" id="cust-name" class="form-control bg-dark text-white border-secondary" placeholder="Enter your full name" required>
                  </div>
                  <div class="form-group mb-3">
                    <label class="small text-muted mb-1">Mobile Phone (+91)</label>
                    <input type="tel" id="cust-phone" class="form-control bg-dark text-white border-secondary" placeholder="10-digit mobile number" pattern="[0-9]{10}" required>
                  </div>
                  <div class="form-group mb-3">
                    <label class="small text-muted mb-1">Delivery Address</label>
                    <textarea id="cust-address" class="form-control bg-dark text-white border-secondary" rows="2" placeholder="Flat / House No, Building, Street, City" required></textarea>
                  </div>
                  <div class="form-group mb-3">
                    <label class="small text-muted mb-1">Payment Method</label>
                    <select class="form-control bg-dark text-white border-secondary">
                      <option>⚡ UPI / Google Pay / PhonePe (Instant)</option>
                      <option>💵 Cash on Delivery (COD)</option>
                      <option>💳 Credit / Debit Card</option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary btn-block py-3 mt-4" style="background: #fac564; color: #000; font-weight: 700; border-radius: 30px; border: none; font-size: 16px;">Place Pizza Order Now 🍕</button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Order Tracking Modal -->
        <div class="modal fade" id="trackerModal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content" style="background: #121212; color: #fff; border: 1px solid rgba(250, 197, 100, 0.4); border-radius: 18px; box-shadow: 0 25px 60px rgba(0,0,0,0.9); text-align: center;">
              <div class="modal-header border-0 pb-0">
                <h5 class="modal-title w-100" style="color: #fac564; font-weight: 700; font-size: 20px;">🔥 Live Order Tracker</h5>
              </div>
              <div class="modal-body p-4">
                <div class="mb-3">
                  <span class="badge badge-warning px-3 py-2" style="background: #fac564; color: #000; font-size: 14px; border-radius: 20px;">Order ID: #<span id="tracker-order-id">PM123456</span></span>
                </div>
                
                <!-- Animated Status Icon -->
                <div id="tracker-status-icon" class="my-4" style="font-size: 55px; animation: pulse 1.5s infinite;">📝</div>
                <h4 id="tracker-status-title" class="text-white font-weight-bold">Order Received!</h4>
                <p id="tracker-status-desc" class="text-muted small mb-4">Our kitchen team is reviewing your delicious pizza order.</p>
                
                <!-- Progress bar -->
                <div class="progress mb-4" style="height: 10px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden;">
                  <div id="tracker-progress-bar" class="progress-bar progress-bar-striped progress-bar-animated bg-warning" role="progressbar" style="width: 20%;"></div>
                </div>

                <div class="d-flex justify-content-between text-muted small px-2 mb-4" style="font-size: 11px;">
                  <span>Received</span>
                  <span>Preparing</span>
                  <span>Oven Baking</span>
                  <span>Out for Delivery</span>
                </div>

                <div class="p-3 mb-3" style="background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
                  <span class="text-muted small d-block">Estimated Hot Delivery Time</span>
                  <span class="font-weight-bold" style="color: #fac564; font-size: 22px;" id="tracker-timer">29 mins 50 secs</span>
                </div>

                <button class="btn btn-outline-light btn-sm rounded-pill px-4 mt-2" data-dismiss="modal">Close & Keep Tracking</button>
              </div>
            </div>
          </div>
        </div>
      `);
    }

    // Floating Cart Button
    if ($('#floating-cart-btn').length === 0) {
      $('body').append(`
        <button id="floating-cart-btn" data-toggle="modal" data-target="#cartModal" style="position: fixed; bottom: 25px; right: 25px; z-index: 999; background: #fac564; color: #000; border: none; width: 58px; height: 58px; border-radius: 50%; box-shadow: 0 10px 25px rgba(250, 197, 100, 0.4); display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;">
          🍕
          <span class="badge-counter" style="position: absolute; top: -4px; right: -4px; background: #e74c3c; color: #fff; font-size: 11px; font-weight: bold; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #121212; display: none;">0</span>
        </button>
      `);
    }
  }

  // Interactive Pizza Builder Widget Injector
  function injectPizzaBuilderWidget() {
    const targetContainer = $('#pizza-builder-mount');
    if (targetContainer.length === 0) return;

    targetContainer.html(`
      <div class="pizza-builder-card p-4 p-md-5" style="background: rgba(18, 18, 18, 0.85); border: 1px solid rgba(250, 197, 100, 0.3); border-radius: 20px; backdrop-filter: blur(15px); box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
        <div class="row align-items-center">
          <div class="col-lg-6 mb-4 mb-lg-0 text-center">
            <div class="pizza-preview-wrap position-relative mx-auto d-flex align-items-center justify-content-center" style="width: 280px; height: 280px; background: radial-gradient(circle, rgba(250,197,100,0.15) 0%, rgba(0,0,0,0) 70%); border-radius: 50%;">
              <img id="builder-pizza-img" src="images/pizza-1.jpg" alt="Custom Pizza" style="width: 220px; height: 220px; object-fit: cover; border-radius: 50%; box-shadow: 0 15px 35px rgba(0,0,0,0.7); border: 4px solid #fac564; transition: all 0.3s ease;">
              <div class="badge badge-warning position-absolute" style="top: 10px; right: 10px; background: #fac564; color: #000; font-size: 12px; font-weight: bold; padding: 6px 12px; border-radius: 20px;" id="builder-size-badge">Medium 12"</div>
            </div>
            <h4 class="text-white mt-3 font-weight-bold" id="builder-pizza-title">My Custom Pizza</h4>
            <p class="text-muted small" id="builder-summary-text">Base: Hand Tossed | Cheese: Mozzarella</p>
            <div class="h3 font-weight-bold" style="color: #fac564;" id="builder-total-price">₹349</div>
          </div>

          <div class="col-lg-6">
            <h3 class="text-white font-weight-bold mb-4" style="font-family: 'Josefin Sans', sans-serif;">🛠️ Build Your Own Pizza</h3>
            
            <!-- Size Selection -->
            <div class="mb-3">
              <label class="text-muted small font-weight-bold d-block mb-2">1. Choose Size</label>
              <div class="btn-group btn-group-toggle w-100" data-toggle="buttons">
                <label class="btn btn-outline-warning btn-sm active flex-fill py-2">
                  <input type="radio" name="builder-size" value="Personal 9&quot;" data-price="249"> Personal 9" (₹249)
                </label>
                <label class="btn btn-outline-warning btn-sm flex-fill py-2 active-default">
                  <input type="radio" name="builder-size" value="Medium 12&quot;" data-price="349" checked> Medium 12" (₹349)
                </label>
                <label class="btn btn-outline-warning btn-sm flex-fill py-2">
                  <input type="radio" name="builder-size" value="Large 14&quot;" data-price="499"> Large 14" (₹499)
                </label>
              </div>
            </div>

            <!-- Crust Selection -->
            <div class="mb-3">
              <label class="text-muted small font-weight-bold d-block mb-2">2. Choose Crust</label>
              <select id="builder-crust" class="form-control bg-dark text-white border-secondary">
                <option value="Classic Pan" data-price="0">Classic Pan Crust (+₹0)</option>
                <option value="Thin &amp; Crispy" data-price="0">Thin &amp; Crispy Sourdough (+₹0)</option>
                <option value="Cheese Burst" data-price="60">Liquid Cheese Burst Crust (+₹60)</option>
                <option value="Garlic Butter Crust" data-price="40">Garlic Butter Herb Crust (+₹40)</option>
              </select>
            </div>

            <!-- Toppings Checklist -->
            <div class="mb-4">
              <label class="text-muted small font-weight-bold d-block mb-2">3. Add Extra Gourmet Toppings (+₹35 each)</label>
              <div class="row px-2">
                <div class="col-6 mb-2">
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input builder-topping" id="top-paneer" value="Paneer Tikka" data-price="35">
                    <label class="custom-control-label text-white small" for="top-paneer">🧀 Paneer Tikka</label>
                  </div>
                </div>
                <div class="col-6 mb-2">
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input builder-topping" id="top-olives" value="Black Olives" data-price="35">
                    <label class="custom-control-label text-white small" for="top-olives">🫒 Black Olives</label>
                  </div>
                </div>
                <div class="col-6 mb-2">
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input builder-topping" id="top-jalapeno" value="Jalapenos" data-price="35">
                    <label class="custom-control-label text-white small" for="top-jalapeno">🌶️ Spicy Jalapenos</label>
                  </div>
                </div>
                <div class="col-6 mb-2">
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input builder-topping" id="top-mushroom" value="Mushrooms" data-price="35">
                    <label class="custom-control-label text-white small" for="top-mushroom">🍄 Button Mushrooms</label>
                  </div>
                </div>
                <div class="col-6 mb-2">
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input builder-topping" id="top-corn" value="Sweet Corn" data-price="35">
                    <label class="custom-control-label text-white small" for="top-corn">🌽 Sweet Corn</label>
                  </div>
                </div>
                <div class="col-6 mb-2">
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input builder-topping" id="top-cheese" value="Extra Cheese" data-price="35">
                    <label class="custom-control-label text-white small" for="top-cheese">🧀 Extra Mozzarella</label>
                  </div>
                </div>
              </div>
            </div>

            <button type="button" id="btn-add-custom-pizza" class="btn btn-warning btn-block py-3 font-weight-bold" style="background: #fac564; color: #000; border-radius: 30px; border: none; font-size: 16px;">
              Add Custom Pizza to Cart 🍕
            </button>
          </div>
        </div>
      </div>
    `);

    // Builder Logic calculation
    function updateBuilderPrice() {
      const selectedSizeOpt = $('input[name="builder-size"]:checked');
      const sizeName = selectedSizeOpt.val();
      const basePrice = parseInt(selectedSizeOpt.data('price'), 10) || 349;

      const crustOpt = $('#builder-crust option:selected');
      const crustName = crustOpt.val();
      const crustPrice = parseInt(crustOpt.data('price'), 10) || 0;

      let toppings = [];
      let toppingsPrice = 0;

      $('.builder-topping:checked').each(function() {
        toppings.push($(this).val());
        toppingsPrice += parseInt($(this).data('price'), 10) || 35;
      });

      const totalPrice = basePrice + crustPrice + toppingsPrice;

      $('#builder-size-badge').text(sizeName);
      $('#builder-summary-text').text(`Crust: ${crustName} ${toppings.length ? '| Toppings: ' + toppings.join(', ') : '| No extra toppings'}`);
      $('#builder-total-price').text(formatINR(totalPrice));
    }

    $(document).on('change', 'input[name="builder-size"], #builder-crust, .builder-topping', updateBuilderPrice);

    $(document).on('click', '#btn-add-custom-pizza', function() {
      const sizeName = $('input[name="builder-size"]:checked').val();
      const crustName = $('#builder-crust option:selected').val();
      let toppings = [];
      $('.builder-topping:checked').each(function() {
        toppings.push($(this).val());
      });

      const price = parseInt($('#builder-total-price').text().replace(/[^0-9]/g, ''), 10);
      const details = `${sizeName}, ${crustName}${toppings.length ? ', ' + toppings.join(', ') : ''}`;

      addToCart('Custom Crafted Pizza', price, 'images/pizza-1.jpg', details);
    });
  }

  // Live Menu Search & Veg/Non-Veg Filter Logic
  function setupMenuFilters() {
    const searchInput = $('#menu-search-input');
    if (searchInput.length === 0) return;

    function filterMenu() {
      const query = searchInput.val().toLowerCase().trim();
      const activeFilter = $('.menu-filter-btn.active').data('filter') || 'all';

      $('.services-wrap, .pricing-entry, .menu-wrap').each(function() {
        const title = $(this).find('h3').text().toLowerCase();
        const desc = $(this).find('p').text().toLowerCase();
        const matchesQuery = !query || title.includes(query) || desc.includes(query);

        let matchesCategory = true;
        if (activeFilter === 'veg') {
          matchesCategory = title.includes('veg') || desc.includes('paneer') || desc.includes('margherita') || desc.includes('greek') || desc.includes('tomato') || desc.includes('mushroom');
        } else if (activeFilter === 'special') {
          matchesCategory = title.includes('special') || title.includes('supreme') || title.includes('burst') || title.includes('feast');
        }

        if (matchesQuery && matchesCategory) {
          $(this).closest('.col-lg-4, .col-md-4, .col-md-6, .col-lg-3').fadeIn(200);
        } else {
          $(this).closest('.col-lg-4, .col-md-4, .col-md-6, .col-lg-3').fadeOut(200);
        }
      });
    }

    searchInput.on('keyup input', filterMenu);

    $(document).on('click', '.menu-filter-btn', function() {
      $('.menu-filter-btn').removeClass('active btn-warning').addClass('btn-outline-warning');
      $(this).addClass('active btn-warning').removeClass('btn-outline-warning');
      filterMenu();
    });
  }

  // Document Ready Setup
  $(document).ready(function () {
    // Hide loader failsafe
    if ($('#ftco-loader').length > 0) {
      setTimeout(function() {
        $('#ftco-loader').removeClass('show');
      }, 200);
    }

    injectCartUI();
    updateCartUI();
    injectPizzaBuilderWidget();
    setupMenuFilters();

    // Event: Click on Order / Add to cart buttons across site
    $(document).on('click', 'a.btn, button.btn', function (e) {
      const text = $(this).text().trim().toLowerCase();
      if (text.includes('order') || text.includes('add to cart') || text.includes('add +')) {
        e.preventDefault();

        let card = $(this).closest('.services-wrap, .pricing-entry, .menu-wrap, .slider-item, .col-md-3, .col-md-4, .col-md-6');
        if (card.length === 0) return;

        let title = card.find('h3').first().text().trim() || 'Delicious Artisan Pizza';
        let priceStr = card.find('.price').first().text().trim() || '₹249';

        let imgElem = card.find('.img, img').first();
        let imageSrc = 'images/pizza-1.jpg';

        if (imgElem.length > 0) {
          if (imgElem.is('img')) {
            imageSrc = imgElem.attr('src');
          } else {
            let bg = imgElem.css('background-image');
            if (bg && bg !== 'none') {
              imageSrc = bg.replace(/^url\((['"]?)(.*?)\1\)$/, '$2');
            }
          }
        }

        addToCart(title, priceStr, imageSrc);
      }
    });

    // Quantity Handlers
    $(document).on('click', '.btn-increase', function () {
      const idx = $(this).data('index');
      cart[idx].quantity += 1;
      saveCart();
    });

    $(document).on('click', '.btn-decrease', function () {
      const idx = $(this).data('index');
      if (cart[idx].quantity > 1) {
        cart[idx].quantity -= 1;
      } else {
        cart.splice(idx, 1);
      }
      saveCart();
    });

    $(document).on('click', '.btn-remove', function () {
      const idx = $(this).data('index');
      cart.splice(idx, 1);
      saveCart();
    });

    // Apply Coupon Event
    $(document).on('click', '#btn-apply-coupon', function() {
      const code = $('#coupon-input').val().toUpperCase().trim();
      if (code === 'PIZZA100') {
        activeCoupon = 'PIZZA100';
        showToast('Coupon PIZZA100 Applied! Saved ₹100', 'coupon');
        $('#coupon-feedback').text('✅ ₹100 Flat Discount Applied!').css('color', '#28a745').show();
      } else if (code === 'CRUNCH20') {
        activeCoupon = 'CRUNCH20';
        showToast('Coupon CRUNCH20 Applied! 20% Off', 'coupon');
        $('#coupon-feedback').text('✅ 20% Off Applied!').css('color', '#28a745').show();
      } else {
        $('#coupon-feedback').text('❌ Invalid Coupon Code. Try PIZZA100 or CRUNCH20').css('color', '#dc3545').show();
      }
      renderCartItems();
    });

    // Open Checkout Modal
    $(document).on('click', '#btn-checkout', function () {
      $('#cartModal').modal('hide');
      setTimeout(function () {
        $('#checkoutModal').modal('show');
      }, 400);
    });

    // Handle Order Form Submission & Start Live Tracker
    $(document).on('submit', '#orderForm', function (e) {
      e.preventDefault();
      const orderId = 'PM' + Math.floor(100000 + Math.random() * 900000);
      $('#checkoutModal').modal('hide');

      cart = [];
      activeCoupon = '';
      saveCart();

      // Show Order Tracker Modal
      setTimeout(function () {
        $('#tracker-order-id').text(orderId);
        $('#trackerModal').modal('show');

        // Order Tracker Step Simulation
        let step = 1;
        const trackerInterval = setInterval(function() {
          step++;
          if (step === 2) {
            $('#tracker-status-icon').text('👨‍🍳');
            $('#tracker-status-title').text('Dough Kneaded & Topped!');
            $('#tracker-status-desc').text('Our chef is adding fresh mozzarella and secret Italian herbs.');
            $('#tracker-progress-bar').css('width', '50%');
          } else if (step === 3) {
            $('#tracker-status-icon').text('🔥');
            $('#tracker-status-title').text('Baking in Wood-Fired Oven!');
            $('#tracker-status-desc').text('Baking at 450°C for that authentic smoky, crispy crust.');
            $('#tracker-progress-bar').css('width', '75%');
          } else if (step === 4) {
            $('#tracker-status-icon').text('🛵');
            $('#tracker-status-title').text('Out for Delivery!');
            $('#tracker-status-desc').text('Our delivery partner is zooming towards your location.');
            $('#tracker-progress-bar').css('width', '100%').removeClass('bg-warning').addClass('bg-success');
            clearInterval(trackerInterval);
          }
        }, 4000);

      }, 400);
    });

    // Contact Form Handlers
    $(document).on('submit', '.contact-form, .appointment-form, .comment-form-wrap form', function (e) {
      e.preventDefault();
      showToast('✨ Thank you! Your message has been sent successfully.');
      this.reset();
    });
  });

})(jQuery);
