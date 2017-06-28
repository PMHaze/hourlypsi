var geocoder,
    map,
    infowindow;

function initialize() {
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(1.3537459, 103.8240449);
    var mapOptions = {
        zoom: 12,
        center: latlng
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(map, "click", function(event) {
        infowindow.close();
    });
    
    Tabletop.init({
        key: 'YOUR_API_KEY_HERE',
        callback: mapCode,
        simpleSheet: true
    })
}

function mapCode(data, tabletop) {
    var address, i = 0;
    function mapNextAddress() {
        address = 'Singapore ' + data[i]['Postal code'];
        console.log(address);
        codeAddress(address);
        if (++i < data.length) {
            setTimeout(mapNextAddress, 300);
        }
    };
    mapNextAddress();
}

function codeAddress(address, centering) {
    geocoder.geocode({
        'address': address
    }, function(results, status) {
        if (status == 'OK') {
            if (centering !== undefined && centering)
                map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
            marker.addListener('click', function() {
                infowindow.close();
                infowindow.setContent('<b>Address:</b> ' + address);
                infowindow.open(map, marker);
            });
        } else {
            console.error('Geocode was not successful for the following reason: ' + status);
        }
    });
}
