/*
 * Translated by icedwater
 * For PM.Haze
 */

jQuery(document).ready(function() {
    // PSI / PM 2.5 conversion rates according to NEA table at http://www.haze.gov.sg/docs/default-source/faq/computation-of-the-pollutant-standards-index-%28psi%29.pdf
    var conversion = [
        {psi: 0, pm2_5: 0},
        {psi: 50, pm2_5: 12},
        {psi: 100, pm2_5: 55},
        {psi: 200, pm2_5: 150},
        {psi: 300, pm2_5: 250},
        {psi: 400, pm2_5: 350},
        {psi: 500, pm2_5: 500}
    ];

    // Based on a given PM 2.5 rating, estimate the PSI using the conversion table.
    // Returns strings in case PM 2.5 exceeds 500 or we are unable to determine it.
    // Find current PM 2.5 value band and divide PSI bandwidth by PM 2.5 bandwidth.
    // Use the ratio to scale the offset of the current PM 2.5 value from its band.
    // Return the rounded sum of the scaled offset and current PSI band minimum.
    function computeEstimatedPSI(pm2_5) {
        if (pm2_5 > 500) {
            // Huge problem!!!
            return "ABOVE 500!";
        }

        for (var i = 1; i < conversion.length; ++i) {
            if (pm2_5 <= conversion[i].pm2_5) {
                return Math.round((conversion[i].psi - conversion[i - 1].psi) / (conversion[i].pm2_5 - conversion[i - 1].pm2_5) * (pm2_5 - conversion[i - 1].pm2_5) + conversion[i - 1].psi);
            }
        }

        // Unable to compute, return error.
        return "Unable to determine";
    }

    // Get current PM 2.5 values in XML and parse them.
    // Your NEA API key is needed here.
    // Update HTML with parsed time, geo coords and PSI.
    function updateHaze() {
        // Based on information on https://www.nea.gov.sg/docs/default-source/api/developer%27s-guide.pdf?sfvrsn=2 (pp. 25-26)
        $.ajax({
            type: "GET",
            url: "http://api.nea.gov.sg/api/WebAPI/?dataset=pm2.5_update&keyref=YOUR_API_KEY_HERE",
            cache: false,
            dataType: "xml",
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
            },
            success: function(data,textStatus,jqXHR) {
                jQuery(data).find("region").each(function() {
                    var region = jQuery(this);
                    var element = jQuery("#" + region.find("id").text());
                    element.find(".latitude").html(region.find("latitude").text());
                    element.find(".longitude").html(region.find("longitude").text());
                    var record = region.find("record");
                    var timestamp = record.attr("timestamp");
                    var year = timestamp.substr(0, 4);
                    var month = timestamp.substr(4, 2);
                    var day = timestamp.substr(6, 2);
                    var hour = timestamp.substr(8, 2);
                    var minute = timestamp.substr(10, 2);
                    var second = timestamp.substr(12, 2);
                    element.find(".timestamp").html(day + "/" + month + "/" + year + " " + hour + ":" + minute + ":" + second);
                    var reading = record.find("reading");
                    element.find(".reading").html(computeEstimatedPSI(parseFloat(reading.attr("value"))));
                    element.find(".type").html(reading.attr("type"));
                });
            }
       });
    }

    setInterval(updateHaze, 60000);
    updateHaze();
});
