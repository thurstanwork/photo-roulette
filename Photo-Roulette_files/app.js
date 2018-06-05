
$(function(){

    // You must supply a Trove API key
    var troveAPIKey = 'dkv88nbt259hvs05';
    // Words you want to search for -- separate multiple values with spaces, eg:
    // var keywords = 'queensland, anzac';
    
    var keywords = 'queensland';
    // Either provide full API query here or include options below
    var apiQuery = 'https://trove-proxy.herokuapp.com/api/result?zone=picture&l-advformat=Photograph&encoding=json&l-availability=y&n=1&key=dkv88nbt259hvs05'
    
    // How you want to combine keywords -- all, any, or phrase
    var keywordType = 'all'
    // Limit to a particular year
    // This was added on 10 August 2017 because one of the people who
    // attended my talk to ACT teacher librarians asked if it was possible to
    // have a version that always gave a particular year as an answer. I think it
    // was for a treasure hunt type thing.
    var year = '';
    // Newspaper id numbers -- separate multiple values with spaces, eg:
    // var titles = '840 35';
    var titles = '';
    // Add a byline, eg:
    var byline = 'Created by <a href="https://timsherratt.org">Tim Sherratt</a>. Adapted for the State Library of Queensland by Niall Stone.'
    // var byline = '';
    // Add a tagline
    var tagline = 'How well do you know your Queensland history?';
    // Leave this alone unless you're publishing on a non-https server
    var useHttps = 'true';

    // YOU CAN ALSO EDIT THESE MESSAGES IF YOU WANT TO
    // These are the hints you get after each guess
    // While the numbers here should reflect distance to correct guess, the actual display order + time is in give_message()
    var messages = {};
    messages['gt100'] = "Ummm... really... that's your guess? It's much much earlier!";
    messages['gt50'] = "Oh no! You're way off. It's a lot earlier.";
    messages['gt10'] = "Getting close, but it's still quite a bit earlier.";
    messages['gt5'] = "Almost! Try a bit earlier.";
    messages['gt1'] = "You're right next to the mark! Try just a tiny bit earlier!";
    messages['lt100'] = "Come on, get serious! It's much much later.";
    messages['lt50'] = "Nope, missed the mark there. It's a lot later.";
    messages['lt10'] = "Not bad, but it's still quite a bit later.";
    messages['lt5'] = "So close! Try a bit later.";
    messages['lt1'] = "You're right next to the mark! Try just a tiny bit later!";

    // These are the messages you get if you guess correctly
    // The numbers 1-10 represent to number of guesses taken
    var success_messages = [];
    success_messages[1] = 'What! How did you... are you cheating?';
    success_messages[2] = 'The force is strong with this one...';
    success_messages[3] = 'We salute you and your profound temporal knowledge!';
    success_messages[4] = 'Excellent work!';
    success_messages[5] = "Don't get cocky kid...";
    success_messages[6] = 'A good solid effort. Some room for improvement.';
    success_messages[7] = 'Not bad. Needs to pay more attention in class.';
    success_messages[8] = 'You had us worried, but you got there in the end.';
    success_messages[9] = 'Living dangerously huh? You only just made it.';
    success_messages[10] = 'Eeek! A last gasp victory!';

    // YOU DON'T REALLY NEED TO EDIT ANYTHING ELSE

    var total = 0;
    let q
  
    //Format the query string by adding keyword/s, cleaning it up and returning it.
    function clean_query() {
        var query;
        if(document.getElementById('customQuery').value){
          keywords = document.getElementById('customQuery').value;
        }
        else{ keywords = "queensland";}
        query = apiQuery.replace(/&n=\d+/, "").replace(/&s=\d+/, "").replace(/&key=[a-z0-9]+/, "").replace(/&encoding=xml/, "&encoding=xml")
            if (keywords !== '') {
                let words = keywords.split(' ');
                if (keywordType == 'any') {
                    q = words.join('+OR+');
                } else if (keywordType == 'phrase') {
                    q = '"' + words.join('+') + '"';
                } else {
                    q = words.join('+AND+');
                }
          query = query + "&q=" + q
          //uncomment to get only State Library of Queensland results.
          query= query + "&q-location=QSL&q-location=QPQ%3ABAN&q-location=QPQ%3ABRCL&q-location=QPQ%3ABUN&q-location=QPQ%3AAYR&q-location=QPQ%3ACCL&q-location=QPQ%3AFCL&q-location=QPQ%3ACOO&q-location=QPQ%3AHSLS&q-location=QPQ%3AMRCL&q-location=QPQ%3AMI&q-location=QPQ%3AMU&q-location=QPQ%3APAT&q-location=QPQ%3ASRL&q-location=QPQ%3ATBL&q-location=QPQ%3ADWP"
        }
        return query;
    }
  
    //Creates a query string from the 'cleaned' query list, including a reference to a random article within the query as a whole
    function get_article_query() {
        var number = Math.floor(Math.random() * total);
        var query = clean_query()
        query = query + "&n=1&s=" + number + "&key=" + troveAPIKey;
        return query;
    }
  //Initializes process for article loading, displaying the loading UI and searching for an article.
    function get_random_article() {
        $("#headline").text('Choosing a random article...');
        $("#article").showLoading();
        var query;
        if (total === 0) {
            query = clean_query()
            query = query + "&n=0&key=" + troveAPIKey;
            get_api_result(query, 'total');
        } else {
            query = get_article_query();
            get_api_result(query, 'article');
        }
    }
  
    //Passes results of a given query to process_results, can also provide the number of articles in the query.
    function get_api_result(query, type) {
        return $.ajax({
            "dataType": "jsonp",
            "url": query,
            "timeout": 10000
        })
        .retry({times: 5, timeout: 1000})
        .done(function(results) {
            window.setTimeout(process_results(results, type),3000);
        })
        .fail(function(xmlReq, txtStatus, errThrown){
            $("#article").hideLoading();
            $("#headline").text("Oh no! Something went wrong... Click 'Reload' to try again.");
        });
    }
    
    //Results processing. Given results, ensure they are valid. If invalid for any reason, or errors occur, attempt to get another article, otherwise display this article on the page.
    function process_results(results, type) {
        if (type == 'total') {
            total = results.response.zone[0].records.total;
            let query = get_article_query();
            get_api_result(query, 'article');
        } else if (type == 'article') {
          try{
            if(document.getElementById('customQuery').value){
              total = results.response.zone[0].records.total;
            }
            let check = results.response.zone[0].records.work[0].issued == ''
            var article = results.response.zone[0].records.work[0];
            if(typeof article.issued != "number" && typeof article.date != "number" || article.issued > 2020 || article.issued <1865){
              $("#article").hideLoading();
              get_random_article()}
            else{
                  if(article.identifier[1].value == "" || article.title.includes("supplement to the Queenslander, ")){
                $("#article").hideLoading();
                get_random_article()
              }
              else{
                display_article(article);
              }
            }
          }
          catch(err){
            $("#article").hideLoading();
            get_random_article()
          }
        }
    }
    //Shows the image on-page, as well as description & title. initializes 'year' variable for checking against.
    function display_article(article) {
      //the 'date' can occur in two places in the query data. Check for the preferred, then the other option.
      if(article.date){
        var date = $.format.date(article.date + ' 00:00:00.000', 'd MMMM yyyy');
        var year = article.date.substr(0,4);
      }
      else{
        var date = $.format.date(article.issued+ ' 00:00:00.000', 'd MMMM yyyy');
        var year = ''+article.issued+''
        year = year.substr(0,4);
        //DEBUG - Uncomment to get debug years 
        //console.log(year)
      }
      //Load the image into the box - if there is no image, an error will be thrown and search restarted.
      try{
        document.getElementById("imgbox").src=(article.identifier[1].value)
      }
      catch(err){
        $("#article").hideLoading();
              get_random_article()
      }
      //Loads the article's title. If the length is > 150, load only the first 120 chars. 'mask_year' ensures that the year is not displayed on the page.
      //If there is no title, display a generic string instead.
      try{
        if(article.title.startsWith("TITLE")){
             var pattern = new RegExp("(?=TITLE:).*(?=CATE)");
             $('#headline').html((mask_year(pattern.exec(article.title)[0], year)).substr(0,120));
           }
        else if(mask_year(article.title,year).length < 150){
          $('#headline').html(mask_year(article.title, year))
        }else{
          $('#headline').html(mask_year(article.title.substr(0,120), year)+"...")
        }
      }
      catch(err){
        $('#headline').html(mask_year("Unknown Title", year));
    }
      //Similar to above, display 'Unknown Contributor' if the data is not present, otherwise show the masked version of the contributor.
      try{
        $('#summary').html(mask_year(article.contributor[0], year));
        if(article.contributor[0] == "Unidentified" || article.contributor[0] == "Unknown"){
           $('#summary').html("Unidentified Contributor")
        }
      }
      catch(err){
        $('#summary').html(mask_year("Unknown Contributor", year));
      }
    
        let newspaper
        //If we're here, all checks have passed. Display the information we've cleaned up and setup for guessing, hiding the loading elements.
        $('#summary, #paper, #count').show();
        $('#date').text(date);
        $('#article-link').html('<a class="btn btn-mini btn-primary" href="' + article.troveUrl + '">More Information</a>');
        $('#year').data('year', year);
        $("#article").hideLoading();
        $("#year").focus();
      
    }
    //If the year value we're searching for appears anywhere in given text, mask it with *s
    function mask_year(text, year) {
        text = text.replace(year, '****');
        return text;
    }

    //As user guesses, check correctness; if correct, display the 'correct' message for that number of guesses, otherwise decrease their guess count and change formatting
    function guess() {
        var guess = $("#year").val();
        var guesses = $("#guesses").data("guesses") + 1;
        if (guess == $("#year").data('year')) {
            correct(guesses);
        } else {
            if (guesses < 10) {
                give_message(guess, guesses);
                $("#guesses").data("guesses", guesses);
                $("#guesses").text(10 - guesses);
                if (guesses == 4) {
                    $("#text-guesses").removeClass('status-ok').addClass('status-warning');
                    $("#count").removeClass('border-ok').addClass('border-warning');
                } else if (guesses == 7) {
                    $("#text-guesses").removeClass('status-warning').addClass('status-danger');
                    $("#count").removeClass('border-warning').addClass('border-danger');
                }
                if (guesses == 9) {
                    $("#text-guesses").text('guess left');
                }
                $("#year").focus();
            } else {
                $("#text-guesses").text('guesses left');
                fail();
            }

        }
    }
    //Display the message for the given guess count in the box.
    function correct(guesses) {
        $("#status").html("<b>That's it!</b><br>" + success_messages[guesses]).removeClass().addClass('alert alert-success');
    }
    //Depending on the guesses left, display a pre-determined message and change formatting.
    function give_message(guess, guesses) {
        var year = $("#year").data('year');
        var difference = parseInt(guess, 10) - year;
        var message;
        if (difference >= 100) {
            message = messages['gt100'];
            $("#status").removeClass().addClass('alert alert-danger').text(message);
        } else if (difference < 50 && difference >= 10) {
            message = messages['gt50'];
            $("#status").removeClass().addClass('alert alert-warning').text(message);
        } else if (difference < 10 && difference >= 5) {
            message = messages['gt10'];
            $("#status").removeClass().addClass('alert alert-info').text(message);
        } else if (difference < 5 && difference >= 2) {
            message = messages['gt5'];
            $("#status").removeClass().addClass('alert alert-success').text(message);
        }else if (difference < 2 && difference >= 1) {
            message = messages['gt1'];
            $("#status").removeClass().addClass('alert alert-success').text(message);
        } else if (difference <= -100) {
            message = messages['lt100'];
            $("#status").removeClass().addClass('alert alert-danger').text(message);
        } else if (difference > -50 && difference <= -15) {
            message = messages['lt50'];
            $("#status").removeClass().addClass('alert alert-warning').text(message);
        } else if (difference > -15 && difference <= -5) {
            message = messages['lt10'];
            $("#status").removeClass().addClass('alert alert-info').text(message);
        } else if (difference > -5 && difference <= -2) {
            message = messages['lt5'];
            $("#status").removeClass().addClass('alert alert-success').text(message);
        }else if (difference > -2 && difference <= -1) {
            message = messages['lt1'];
            $("#status").removeClass().addClass('alert alert-success').text(message);
        }

    }
    //On fail, display failure message and try again.
    function fail() {
        $("#guesses").text(0);
        $("#status").removeClass().addClass('alert alert-danger').text("Ooops! Follow the link to view the image, or hit reload to try again.");
        $("#pub_details").show();
    }
    //Reset all values for a new attempt.
    function reset() {
        $("#year").val("");
        $("#headline").text('Choosing a random photo...');
        $("#guesses").data("guesses", 0).text(10);
        $("#text-guesses").removeClass('status-warning status-danger').addClass('status-ok');
        $("#count").removeClass('border-warning border-danger').addClass('border-ok');
        $("#summary").empty();
        $("#paper").empty();
        $("#pub_details").hide();
        $("#status").empty().removeClass();
        get_random_article();
    }
    $('#year').keydown(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            guess();
        }
    });
    $('#customQuery').keydown(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            reset();
        }
    });
    $("#guess-button").button().click(function() { guess(); });
    $("#reload-button").button().click(function() { reset(); });
    $("#guesses").data("guesses", 0);
    $("#pub_details").hide();
    $('#tagline').html(tagline);
    $('#byline').html(byline);
    get_random_article();
});


