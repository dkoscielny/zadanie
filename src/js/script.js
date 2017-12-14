function calculateOrder(){
    var VAT = 23,
        productName = $('#productName').val(),
        costPerItem = $('#costPerItem').val(),
        quantity = $('#quantity').val(),
        grossPLN = ( quantity* costPerItem ).toFixed(2),
        netPLN = ( quantity* costPerItem* (100- VAT)/100 ).toFixed(2),
        midRate_USD,
        midRate_EUR,
        netEUR,
        netUSD,

        createRow = function(productName, costPerItem, quantity, grossPLN, netPLN, netEUR, netUSD){
            $tbody = $('.summary__table > tbody');
            $tr = $('<tr></tr>');

            var i = 0;
            for(i; i < arguments.length; i++){
                $td = $('<td>' + arguments[i] + '</td>');
                $tr.append($td);
            }
            $tr.append('<td class="deleteItem"><i class="fa fa-trash" aria-hidden="true"></i></td>');
            $tr.css('display', 'none');

            $tbody.append($tr);
            $tr.fadeIn('slow');
        },

        getRate_USD = function(){
            return $.get( "http://api.nbp.pl/api/exchangerates/rates/A/USD/", function(data){
                midRate_USD = data.rates[0].mid;
            });
        },

        getRate_EUR = function(){
            return $.get( "http://api.nbp.pl/api/exchangerates/rates/A/EUR/", function(data){
                midRate_EUR = data.rates[0].mid;
            });
        };
        
    // show message during connecting to the server
    $(".summary__counting").fadeIn('slow');

    // wait until responses for both requests are recived
    $.when(
        getRate_EUR().then(
            //on success
            function() {
                netEUR = ( netPLN/ midRate_EUR ).toFixed(2);
            }, 
            //on fail
            function() {
                netEUR = "Nie można pobrać aktualnego kursu.";
            }
        ), 
        getRate_USD().then(
            //on success
            function() {
                netUSD = ( netPLN/ midRate_USD ).toFixed(2);
            }, 
            //on fail
            function() {
                netUSD = "Nie można pobrać aktualnego kursu.";
            }
        )
    // and then continue
    ).always(function(){
        // hide message after all
        $(".summary__counting").fadeOut('slow');
        createRow(productName, quantity, costPerItem, grossPLN, netPLN, netEUR, netUSD);
    });
}

$( document ).ready(function() {

    // form submit action activates calculateOrder function and clears form
    $("#order__form").on('submit', function (e) {
        e.preventDefault();
        var $form = $(this);

        calculateOrder();
        $form.trigger('reset');
     });

    // remove row in the table on deleteItem click
    $('.summary__table').on('click', '.deleteItem', function(){
        $row = $(this).parent();
        $row.hide('slow', function(){ 
            $row.remove(); 
        });
    });

});
    
    


