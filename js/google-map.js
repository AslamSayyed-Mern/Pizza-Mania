/**
 * Pizza Mania - Interactive Location Map
 */

document.addEventListener("DOMContentLoaded", function() {
    var mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Check if Leaflet (L) is available
    if (typeof L !== 'undefined') {
        // Connaught Place, New Delhi coordinates
        var lat = 28.6315;
        var lng = 77.2167;

        var map = L.map('map', {
            center: [lat, lng],
            zoom: 14,
            scrollWheelZoom: false
        });

        // Dark tile layer matching Pizza Mania aesthetic
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        var customIcon = L.divIcon({
            className: 'custom-map-marker',
            html: '<div style="background-color: #fac564; color: #000; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 0 20px rgba(250, 197, 100, 0.8); border: 2px solid #fff;">🍕</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        L.marker([lat, lng], { icon: customIcon }).addTo(map)
            .bindPopup('<div style="text-align: center; color: #000;"><h6 style="margin: 0; font-weight: bold; color: #d9534f;">🍕 Pizza Mania Flagship</h6><p style="margin: 5px 0 0; font-size: 12px; color: #333;">Connaught Place, Inner Circle<br>New Delhi - 110001</p></div>')
            .openPopup();
    } else {
        mapElement.innerHTML = `
            <div style="width:100%; height:100%; min-height: 400px; background:#121212; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fac564; padding:30px; text-align:center; border: 1px solid rgba(250,197,100,0.2);">
                <div style="font-size: 48px; margin-bottom: 15px;">🍕</div>
                <h3 style="color: #fac564; font-family: 'Josefin Sans', sans-serif; font-size: 26px; margin-bottom: 10px;">Pizza Mania Flagship Store</h3>
                <p style="color:#ddd; max-width: 400px; margin-bottom: 8px;">Connaught Place, Inner Circle, Block A, New Delhi - 110001</p>
                <p style="color:#aaa; font-size: 14px;">📞 Phone: +91 98765 43210 | 📧 Email: order@pizzamania.in</p>
                <p style="color:#888; font-size: 13px; margin-top: 15px;">Open Daily: 10:00 AM – 11:30 PM (Hot Fresh Delivery Available)</p>
            </div>
        `;
    }
});