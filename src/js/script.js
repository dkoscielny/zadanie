function Order(){

    var self = this,
        VAT = 23,
        productName,
        costPerItem,
        quantity,
        grossPLN,
        netPLN,
        midRate_USD,
        midRate_EUR,
        netEUR,
        netUSD;

    self.calculateOrder = function(){
        productName = $('#newOrder__productName').val();
        costPerItem = parseFloat( $('#newOrder__costPerItem').val() ).toFixed(2);
        quantity = $('#newOrder__quantity').val();
        grossPLN = (quantity* costPerItem ).toFixed(2);
        netPLN = (quantity* costPerItem* (100- VAT)/100 ).toFixed(2);

        $('#newOrder__summary-modal').modal('show'); 
        // show message in modal during connecting to the server and calculating
        $(".summary__counting").show();
    
        var getRate_USD = function(){
            return $.get( "http://api.nbp.pl/api/exchangerates/rates/A/USD/", function(data){
                midRate_USD = data.rates[0].mid;
            });
        },
    
            getRate_EUR = function(){
                return $.get( "http://api.nbp.pl/api/exchangerates/rates/A/EUR/", function(data){
                    midRate_EUR = data.rates[0].mid;
                });
            },
        
            putDataIntoModal = function(productName, costPerItem, quantity, grossPLN, netPLN, netEUR, netUSD){
                var $dataDiv = $('.summary__data'),
                    i = 0;
                for(i; i < arguments.length; i++){
                    $dataDiv.find('div:nth-of-type('+(i+1)+') > span:nth-of-type(2)').text(arguments[i]);
                }     
            };
        
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
            $(".summary__counting").hide();
            // and show summary
            $(".summary__data").fadeIn('slow');
    
            putDataIntoModal(productName, quantity, costPerItem, grossPLN, netPLN, netEUR, netUSD);
        });
    };

    self.addToTheBasket = function(){
        $tbody = $('.basket__table > tbody');
        $tr = $('<tr></tr>');
        
        var i = 0,
            rowValues = [productName, quantity, costPerItem, grossPLN, netPLN, netEUR, netUSD];

        for(i; i < rowValues.length; i++){
            $td = $('<td>' + rowValues[i] + '</td>');
            $tr.append($td);
        }

        $tr.append('<td class="basket__deleteItem"><i class="fa fa-trash" aria-hidden="true"></i></td>');
        $tr.hide();

        $tbody.append($tr);
        $tr.fadeIn('slow');
    };

    self.checkIfShowTableFooter = function(){
        if($('.basket__table tbody').children().length == 0){
            $('.basket__table tfoot').show('slow');
        }
    };

    self.checkIfHideTableFooter = function(){
        if($('.basket__table tbody').children().length == 1){
           $('.basket__table tfoot').hide('slow');
        }
    };

    self.calculateTotalSum = function(){
        var i = 4;

        for(i; i <= 7; i++){
            var sum = 0;
            $('.basket__table tbody td:nth-of-type('+ i +')').each(function() {
                sum +=  parseFloat( $(this).text());
            });

            $('.basket__table tfoot td:nth-of-type('+ (i-2) +')').text(sum.toFixed(2));
        }
    };

}
var order = new Order();

$( document ).ready(function(){

    // form submit action activates calculateOrder function
    $("#newOrder__form").on('submit', function (e) {
        e.preventDefault();
        order.calculateOrder();
    });

    $('.summary__btn-toBasket').on('click', function(){
        order.checkIfShowTableFooter(); 
        order.addToTheBasket();
        var $form = $("#newOrder__form");
        $form.trigger('reset');
        $('#newOrder__summary-modal').modal('hide');
        order.calculateTotalSum();
    });

    // remove row in the table on deleteItem click
    $('.basket__table').on('click', '.basket__deleteItem', function(){
        $row = $(this).parent();
        $row.hide('slow', function(){ 
            $row.remove();
            order.calculateTotalSum();          
        });
        order.checkIfHideTableFooter(); 
    });

});
    
    


