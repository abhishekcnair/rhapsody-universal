/*******
- capture artist names that end with an apostrophe
- capture track names
- filter out generic names and words (no 1. , no. 2 etc)
- show top 10 tracks for each artist
- access rhapsody music database to play music
****/

var stopwords = "music, inc., no., movies, with, the, man, thank, you";

var APPHOST = "http://localhost:8080/"; //"http://10.151.30.170:8080/"; //

var readabilityVersion = "0.4";
var emailSrc = 'http://davehauenstein.com/readability/email.php';
var iframeLoads = 0;
    readStyle = 'style-newspaper';
    readSize = 'size-large';
    readMargin = 'margin-wide';
    _readability_script = document.createElement('SCRIPT');
    _readability_script.type = 'text/javascript';
    _readability_script.src = 'http://localhost:8080/readability-0.5.1/readability-0.5.1/js/readability.js?x=' + (Math.random());
    //document.getElementsByTagName('head')[0].appendChild(_readability_script);
    _readability_css = document.createElement('LINK');
    _readability_css.rel = 'stylesheet';
    _readability_css.href = 'http://localhost:8080/readability-0.5.1/readability-0.5.1/css/readability.css';
    _readability_css.type = 'text/css';
    _readability_css.media = 'screen';
    document.getElementsByTagName('head')[0].appendChild(_readability_css);
    _readability_print_css = document.createElement('LINK');
    _readability_print_css.rel = 'stylesheet';
    _readability_print_css.href = 'http://localhost:8080/readability-0.5.1/readability-0.5.1/css/readability-print.css';
    _readability_print_css.media = 'print';
    _readability_print_css.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(_readability_print_css);

(function(){
})()

function grabArticle() {
	var allParagraphs = document.getElementsByTagName("p");
	var topDivCount = 0;
	var topDiv = null;
	var topDivParas;
	
	var articleContent = document.createElement("DIV");
	var articleTitle = document.createElement("H1");
	var articleFooter = document.createElement("DIV");
	
	// Replace all doubled-up <BR> tags with <P> tags, and remove fonts.
	var pattern =  new RegExp ("<br/?>[ \r\n\s]*<br/?>", "g");
	//document.body.innerHTML = document.body.innerHTML.replace(pattern, "</p><p>").replace(/<\/?font[^>]*>/g, '');
	
	// Grab the title from the <title> tag and inject it as the title.
	articleTitle.innerHTML = document.title;
	//articleContent.appendChild(articleTitle);
	
	// Study all the paragraphs and find the chunk that has the best score.
	// A score is determined by things like: Number of <p>'s, commas, special classes, etc.
	for (var j=0; j	< allParagraphs.length; j++) {
		parentNode = allParagraphs[j].parentNode;

		// Initialize readability data
		if(typeof parentNode.readability == 'undefined')
		{
			parentNode.readability = {"contentScore": 0};			

			// Look for a special classname
			if(parentNode.className.match(/(comment|meta|footer|footnote)/))
				parentNode.readability.contentScore -= 50;
			else if(parentNode.className.match(/((^|\\s)(post|hentry|entry[-]?(content|text|body)?|article[-]?(content|text|body)?)(\\s|$))/))
				parentNode.readability.contentScore += 25;

			// Look for a special ID
			if(parentNode.id.match(/(comment|meta|footer|footnote)/))
				parentNode.readability.contentScore -= 50;
			else if(parentNode.id.match(/^(post|hentry|entry[-]?(content|text|body)?|article[-]?(content|text|body)?)$/))
				parentNode.readability.contentScore += 25;
		}

		// Add a point for the paragraph found
		if(getInnerText(allParagraphs[j]).length > 10)
			parentNode.readability.contentScore++;

		// Add points for any commas within this paragraph
		parentNode.readability.contentScore += getCharCount(allParagraphs[j]);
	}

	// Assignment from index for performance. See http://www.peachpit.com/articles/article.aspx?p=31567&seqNum=5 
	for(nodeIndex = 0; (node = document.getElementsByTagName('*')[nodeIndex]); nodeIndex++)
		if(typeof node.readability != 'undefined' && (topDiv == null || node.readability.contentScore > topDiv.readability.contentScore))
			topDiv = node;

	if(topDiv == null)
	{
	  topDiv = document.createElement('div');
	  topDiv.innerHTML = 'Sorry, readability was unable to parse this page for content. If you feel like it should have been able to, please <a href="http://code.google.com/p/arc90labs-readability/issues/entry">let us know by submitting an issue.</a>';
	}
	
	// REMOVES ALL STYLESHEETS ...
	for (var k=0;k < document.styleSheets.length; k++) {
		if (document.styleSheets[k].href != null && document.styleSheets[k].href.lastIndexOf("readability") == -1) {
			//document.styleSheets[k].disabled = true;
		}
	}

	// Remove all style tags in head (not doing this on IE) :
	var styleTags = document.getElementsByTagName("style");
	for (var j=0;j < styleTags.length; j++)
		if (navigator.appName != "Microsoft Internet Explorer")
			styleTags[j].textContent = "";

	//cleanStyles(topDiv);					// Removes all style attributes
	//topDiv = killDivs(topDiv);				// Goes in and removes DIV's that have more non <p> stuff than <p> stuff
	//topDiv = killBreaks(topDiv);            // Removes any consecutive <br />'s into just one <br /> 

	// Cleans out junk from the topDiv just in case:
	/*
	topDiv = clean(topDiv, "form");
	topDiv = clean(topDiv, "object");
	topDiv = clean(topDiv, "table", 250);
	topDiv = clean(topDiv, "h1");
	topDiv = clean(topDiv, "h2");
	topDiv = clean(topDiv, "iframe");
	*/

	// Add the footer and contents:
	articleFooter.id = "readFooter";
	articleFooter.innerHTML = "\
		<a href='http://www.arc90.com'><img src='http://lab.arc90.com/experiments/readability/images/footer.png'></a>\
                <div class='footer-right' >\
                        <span class='version'>Readability version " + readabilityVersion + "</span>\
		</div>\
	";

	//articleContent.appendChild(topDiv);
	articleContent.appendChild(articleFooter);
	
	return topDiv; //articleContent;
}

// Get the inner text of a node - cross browser compatibly.
function getInnerText(e) {
	if (navigator.appName == "Microsoft Internet Explorer")
		return e.innerText;
	else
		return e.textContent;
}

// Get character count
function getCharCount ( e,s ) {
    s = s || ",";
	return getInnerText(e).split(s).length;
}

function cleanStyles( e ) {
    e = e || document;
    var cur = e.firstChild;

	// If we had a bad node, there's not much we can do.
	if(!e)
		return;

	// Remove any root styles, if we're able.
	if(typeof e.removeAttribute == 'function')
		e.removeAttribute('style');

    // Go until there are no more child nodes
    while ( cur != null ) {
		if ( cur.nodeType == 1 ) {
			// Remove style attribute(s) :
			cur.removeAttribute("style");
			cleanStyles( cur );
		}
		cur = cur.nextSibling;
	}
}

function killDivs ( e ) {
	var divsList = e.getElementsByTagName( "div" );
	var curDivLength = divsList.length;
	
	// Gather counts for other typical elements embedded within.
	// Traverse backwards so we can remove nodes at the same time without effecting the traversal.
	for (var i=curDivLength-1; i >= 0; i--) {
		var p = divsList[i].getElementsByTagName("p").length;
		var img = divsList[i].getElementsByTagName("img").length;
		var li = divsList[i].getElementsByTagName("li").length;
		var a = divsList[i].getElementsByTagName("a").length;
		var embed = divsList[i].getElementsByTagName("embed").length;

	// If the number of commas is less than 10 (bad sign) ...
	if ( getCharCount(divsList[i]) < 10) {
			// And the number of non-paragraph elements is more than paragraphs 
			// or other ominous signs :
			if ( img > p || li > p || a > p || p == 0 || embed > 0) {
				divsList[i].parentNode.removeChild(divsList[i]);
			}
		}
	}
	return e;
}

function killBreaks ( e ) {
	e.innerHTML = e.innerHTML.replace(/(<br\s*\/?>(\s|&nbsp;?)*){1,}/g,'<br />');
	return e;
}

function clean(e, tags, minWords) {
	var targetList = e.getElementsByTagName( tags );
	minWords = minWords || 1000000;

	for (var y=0; y < targetList.length; y++) {
		// If the text content isn't laden with words, remove the child:
		if (getCharCount(targetList[y], " ") < minWords) {
			targetList[y].parentNode.removeChild(targetList[y]);
		}
	}
	return e;
}

function emailBox() {
    var emailContainer = document.getElementById('email-container');
    if(null != emailContainer)
    {
        return;
    }

    var emailContainer = document.createElement('div');
    emailContainer.setAttribute('id', 'email-container');
    emailContainer.innerHTML = '<iframe src="'+emailSrc + '?pageUrl='+escape(window.location)+'&pageTitle='+escape(document.title)+'" scrolling="no" onload="removeFrame()" style="width:500px; height: 490px; border: 0;"></iframe>';

    document.body.appendChild(emailContainer);
}

function removeFrame()
{
    ++iframeLoads;
    if(iframeLoads >= 6)
    {
        var emailContainer = document.getElementById('email-container');
        if(null != emailContainer) {
            emailContainer.parentNode.removeChild(emailContainer);
        }
        // reset the count
        iframeLoads = 0;
    }
}





function isAncestor(thisItem, mytagName){
	//console.log('IS THIS AN ANCESTOR');
	//console.log('THIS IS THE TEXT CONTENT ' + thisItem.textContent);

	while(thisItem.tagName == null || (thisItem.tagName.toLowerCase() != mytagName.toLowerCase() && thisItem.tagName.toLowerCase() != "body")){
		//alert(thisItem.nodeName.toLowerCase());
		//console.log('GOING THROUGH ANCESTOR: ' + thisItem.tagName);
		thisItem = thisItem.parentNode;
		//console.log('my parent is: ' + thisItem.textContent);
	}
	if(thisItem.nodeName.toLowerCase() == mytagName.toLowerCase() ){
	  return true;
	}
	else{
	  return false;
	}
}


function getChildTextNodes(node, includeWhitespaceNodes, includeBR) {
  var textNodes = [], whitespace = /^\s*$/;

  function getTextNodes(mynode) {
	  if (mynode.nodeType == 3) {
		  if ((includeWhitespaceNodes || !whitespace.test(mynode.nodeValue))) {
			//if()
			  textNodes.push(mynode);
			  //console.log('PUSHING NON-WHITESPACE TEXT NODE '+mynode.textContent+' TO TEXTNODES ARRAY');
		  }
	  }
	  else {
		  for (var i = 0, len = mynode.childNodes.length; i < len; ++i) {
			  if(!(isAncestor(mynode.childNodes[i], 'script')) && !(isAncestor(mynode.childNodes[i], 'meta')) && !(isAncestor(mynode.childNodes[i], 'link'))){
				getTextNodes(mynode.childNodes[i]);
			  }
		  }
		  if(includeBR && $(mynode).css('display') == 'block' || (mynode.tagName !== undefined && mynode.tagName.toLowerCase() == 'br')){
			//THIS IS CREATING PROBLEMS WHEN ITERATING THROUGH THE ARRAY RETURNED BY THIS FUNCITON
			//AND TREATING EACH ELEMENT AS A TEXTNODE
			//textNodes.push(document.createElement('BR'));
		  }
	  }
  }

  getTextNodes(node);
  //console.log('RETURNING THIS MANY TEXT NODES ' + textNodes.length);
  return textNodes;
}
  
$(function () {

	$(document).on("mouseenter", "rhapsodyuniversalplayer", function (event){
		//console.log('MOUSEENTERED ON THE PLAYER');
		$(this).find('rhapsodytracks').slideDown('fast','swing');
	});
  
	$(document).on("mouseleave", "rhapsodyuniversalplayer", function (event){
		//console.log('MOUSE LEFT ON THE PLAYER');
		$(this).find('rhapsodytracks').slideUp('fast','swing');
	});

	var objOverlay = document.createElement("div");
	var objinnerDiv = document.createElement("div");
	var articleTools = document.createElement("DIV");
	
	objOverlay.id = "readOverlay";
	objinnerDiv.id = "readInner";
	
	// Apply user-selected styling:
	document.body.className = readStyle;
	objOverlay.className = readStyle;
	objinnerDiv.className = readMargin + " " + readSize;
	
	// Set up tools widget 
	
	// NOTE THE IMAGE URL'S HERE !!!!!!!!!!!!!!!!!
	// NOTE THE IMAGE URL'S HERE !!!!!!!!!!!!!!!!!
	// NOTE THE IMAGE URL'S HERE !!!!!!!!!!!!!!!!!
	articleTools.id = "readTools";
	articleTools.innerHTML = "\
		<a href='#' onclick='return window.location.reload()' title='Reload original page' id='reload-page'>Reload Original Page</a>\
		<a href='#' onclick='javascript:window.print();' title='Print page' id='print-page'>Print Page</a>\
		<a href='#' onclick='emailBox(); return false;' title='Email page' id='email-page'>Email Page</a>\
	";

	//objinnerDiv.appendChild(grabArticle());		// Get the article and place it inside the inner Div
	objOverlay.appendChild(articleTools);
	objOverlay.appendChild(objinnerDiv);		// Insert the inner div into the overlay

	//document.body.innerHTML = "";
	
	// Inserts the new content :
	//document.body.insertBefore(objOverlay, document.body.firstChild);

	$('head').append('<script type="text/javascript">   //<![CDATA[    miniplayer_env = "";    dart_env = "prod";    app_version = "21434672f3c0874a856a2a6018c7212665683147";    fb_app_id = "159930018743";    page_locale = "en";    page_default_locale = "en";    page_country = "us";  //]]> </script>');
/*
	
*/
	var containerhtml = '<div id="container"> <div id="header"> <div id="banner-container"> <div id="banner"> <div ad_bucket="/14643996/Ad-Sales/Rhapsody.com_728x90" ad_height="90" ad_width="728" class="banner-ad" id="banner-content"></div> </div> </div> <div id="header-frame"> <div id="header-content"> <div id="logo"> <a class="ajax" href="/"> <img alt="Rhapsody" height="33" src="/assets/brand/rhapsody/logos/logo.png" title="Rhapsody" width="153"> </a> </div> <div id="search" style="width: 308px"> <form id="searchform"> <input id="searchbutton" title="Search" type="button"> <div id="searchframe"> <input class="default" id="searchbox" type="text" value="Search"> </div> </form> <div id="offline-notice" style="display:none"> Offline - Downloaded Playback Only </div> <script type="text/javascript">   //<![CDATA[     $(document).delegate("body", "siteLoaded", function() {       window.searchns={};           function dataPresent(data, field) { return (data[field] && data[field].length>0)};           function displaySearchResults(query){         searchns.query=$.trim(query);         var sequenceTime = new Date().getTime();         searchns.queryTime = sequenceTime;             var encoded_query = encodeURIComponent($.trim(query));         $.ajax({           url: "/search/typeahead/" + encoded_query + ".json?" + $.param(dynamicQueryParams()),           data: {             max: 10,             name_startsWith: query           },           success: function(data) {             searchns.data = data;             if(searchns.queryTime > sequenceTime){               return;             }             $("#autocomplete-list").remove();             $("#search").append($.render({}, "#autocomplete-list-template"));                 if (data["featured"]) {               //if we have an image for the first artist, make this the featured result               data["featured"]["type"]=Locale.searchMessages[data["featured"]["type"]]               $("#autocomplete-list").append($.render(data["featured"], "#autocomplete-featured-artist-template"));             }             if (data["artists"] && data["artists"].length>0) {               //translate the type if necessary               $.each(data["artists"],function(index,item){                 item.type=Locale.searchMessages[item.type]               });               $("#autocomplete-list").append($.render({showall:Locale.searchMessages["showall"], type:Locale.searchMessages["artists"], searchby:"artist"}, "#autocomplete-header-template"));               $("#autocomplete-list").append($.render(data["artists"], "#autocomplete-item-template"));             }             if (data["tracks"] && data["tracks"].length>0) {               //translate the type if necessary               $.each(data["tracks"],function(index,item){                 item.type=Locale.searchMessages[item.type]               });               $("#autocomplete-list").append($.render({showall:Locale.searchMessages["showall"], type: Locale.searchMessages["tracks"], searchby:"track"}, "#autocomplete-header-template"));               $("#autocomplete-list").append($.render(data["tracks"], "#autocomplete-item-template"));             }                 if (data["albums"] && data["albums"].length>0) {               //translate the type if necessary               $.each(data["albums"],function(index,item){                 item.type=Locale.searchMessages[item.type]               });               $("#autocomplete-list").append($.render({showall:Locale.searchMessages["showall"], type: Locale.searchMessages["albums"], searchby:"album"}, "#autocomplete-header-template"));               $("#autocomplete-list").append($.render(data["albums"], "#autocomplete-item-template"));             }                 $("#autocomplete-list").prepend($.render({query: searchns.query}, "#seeall-template"));                 showPopup($("#autocomplete-list"));             $("#autocomplete-list").position({my: "left top", at: "left bottom",of: "#search", collision: "none"});           }         });       }       $("#searchbutton").live("click", function(){         $("#searchform").trigger("submit", this);         $("#search .ui-autocomplete").remove();       });           $(".searchbythis").live("click", function(event){         searchDropdownLink($(this).data("searchby"), searchns.query, "");         $("#autocomplete-list").hide();         event.stopPropagation();       });           $("div.autocomplete-header").live("mouseover", function(){$(this).children("a").addClass("hover")});           $("div.autocomplete-header").live("mouseleave", function(){$(this).children("a").removeClass("hover")});           $("div.autocomplete-header, #seeallresults").live("click",function(){$(this).children("a:first").click()})           $("#seeallresults").live("click", function(event){         searchDropdownLink("", searchns.query, "");         $("#autocomplete-list").hide();       });           $("#searchbox").live("click", function(event){         if ($("#searchbox").hasClass("default")) {           $("#searchbox").val("");           $("#searchbox").removeClass("default");         } else {           event.stopImmediatePropagation();         }       });           $("div.ui-menu-item").live("click", function(){         searchns.selected=$(this).data("itemname");         navigateToPage($(this).data("prettyurl"));             $("#searchbox").val(Locale.searchMessages.search);         $("#searchbox").addClass("default");         $("#searchbox").blur();             $("#search .ui-autocomplete").remove();       });               $("#searchbox").live("keyup", function(e){         if (e.keyCode==38 || e.keyCode==40 || e.keyCode==13) {return false}         if ($.browser.msie  && parseInt($.browser.version, 10) === 8) {           if ($("#searchbox").val().length>1) {             displaySearchResults($("#searchbox").val());           } else {             $("#autocomplete-list").remove();           }         }       });           $("#searchbox").bind("input paste", function(e) {           var el = $(this);           if ($("#searchbox").hasClass("default")) {             $("#searchbox").val("");             $("#searchbox").removeClass("default");           }           setTimeout(function() {             if ($("#searchbox").val().length>1) {               displaySearchResults($("#searchbox").val());             } else {               $("#autocomplete-list").remove();             }           }, 0);       });           //respond to arrow keys       $(document).keydown(function(e){         //escape key         if (e.keyCode == 27) {           $("#searchbox").blur();           $("#searchbox").val("");           $("#autocomplete-list").remove();           $("#searchbox").focus();           }           // up key           if (e.keyCode == 38) {              selectPreviousItem();              return false;           }           //enter key           if (e.keyCode==13){             el=$("div#autocomplete-list div.ui-menu-item.ui-state-hover, .autocomplete-header.ui-state-hover");             if (el.length==0) {               $("#autocomplete-list").remove();             } else {               if (el.hasClass("ui-menu-item")) {                 el.click();                 $("#autocomplete-list").remove();               } else {               el.click();             }             return false;           }         }               // down key           if (e.keyCode == 40) {             selectNextItem();             return false;           }       });           function selectNextItem(){         el=$("div#autocomplete-list div.ui-menu-item.ui-state-hover, .autocomplete-header.ui-state-hover");             $("div#autocomplete-list div.ui-menu-item, #seeallresults, .autocomplete-header").removeClass("ui-state-hover");             //if an item isn"t already selected         if ((el.length==0)) {           //choose the first list item           el=$("div#autocomplete-list div.ui-menu-item:first")         } else {           //if we"re at the end..           if (el.next(".ui-menu-item, .autocomplete-header").length==0){             // create an empty element that won"t be added to the dom             el=null;             $("#seeallresults").addClass("ui-state-hover");           } else {             el=el.next(".ui-menu-item, .autocomplete-header").first();           }         }         if (el){el.addClass("ui-state-hover")};       }           function selectPreviousItem(){         el=$("div#autocomplete-list div.ui-menu-item.ui-state-hover, .autocomplete-header.ui-state-hover");             $("div#autocomplete-list div.ui-menu-item, #seeallresults, .autocomplete-header").removeClass("ui-state-hover");             //if an item isn"t already selected         if ((el.length==0)) {           //choose the last list item           el=$("div#autocomplete-list div.ui-menu-item:last")         } else {           //if we"re at the beginning..           if (el.prev(".ui-menu-item, .autocomplete-header").length==0){             // create an empty element that won"t be added to the dom             el=null;             $("#seeallresults").addClass("ui-state-hover");           } else {             el=el.prev(".ui-menu-item, #seeallresults, .autocomplete-header");           }         }             if (el){el.addClass("ui-state-hover")};       }           $("#searchform").submit(function (event, src) {         event.preventDefault();         searchDropdownLink("", $("#searchbox").val(), src);         $("#autocomplete-list").remove();       });           function searchDropdownLink(type, search, src) {         if (/\S/.test(search) && search != Locale.searchMessages.search) {           var path = "/search";           if (type != "" && type != "everything") {             path = "/search/" + type;           }               if(src != "") {             $("#searchform").trigger("search-click", src);           }               path += "?" + $.param({query: search});           navigateToPage(path);         }         else{           alert(Locale.searchMessages.searchTermRequired);         }             $("#searchbox").val(Locale.searchMessages.search);         $("#searchbox").addClass("default");         $("#searchbox").blur();         $("#searchbox").autocomplete("close");       }           Locale.searchMessages = {         search: "Search",         searchTermRequired: "You must enter a search term before attempting to search.",         searchBy: "Search By:",         everything: "Everything",         artists: "Artists",         albums: "Albums",         tracks: "Tracks",         track: "track",         artist: "artist",         album: "album",         showall: "Show All"       };         });   //]]> </script>  <script id="autocomplete-item-template" type="text/x-jquery-tmpl"> <div class="ui-menu-item" data-genre="{{=genre}}" data-itemname="{{=name}}" data-prettyurl="{{=pretty_url}}" data-type="{{=type}}" role="menuitem"> <div class="ui-corner-all {{=type}}" tabindex="-1"> <span class="type"></span> <span class="name"> {{=name}} <span class="description"> {{=description}} </span> </span> </div> </div> </script> <script id="autocomplete-featured-artist-template" type="text/x-jquery-tmpl"> <div class="ui-menu-item {{=type}}" data-genre="{{=genre}}" data-itemname="{{=name}}" data-prettyurl="{{=pretty_url}}" data-type="Featured Image : {{=type}}" id="autocomplete-featured-artist" role="menuitem"> <div class="image"> <img class="{{=type}}" src="{{=image_url}}" /> </div> <div class="description"> <div class="type"> {{=type}} </div> </div> <div class="artist-name"> <span class="name"> {{=name}} </span> <br /> <span class="description"> {{=description}} </span> </div> </div> </script> <script id="autocomplete-header-template" type="text/x-jquery-tmpl"> <div class="autocomplete-header search-header"> <a class="type searchbythis" data-searchby="{{=searchby}}"> {{=type}} </a> <a class="showall searchbythis" data-searchby="{{=searchby}}"> {{=showall}} > </a> </div> </script> <script id="autocomplete-list-template" type="text/x-jquery-tmpl"> <div aria-activedescendant="ui-active-menuitem" class="ui-autocomplete site-search" id="autocomplete-list" role="listbox"></div> </script> <script id="seeall-template" type="text/x-jquery-tmpl"> <div class="searchbythis seeall ui-state-hover" data-searchby="everything" id="seeallresults"> <span class="see-all-results"> Search for <span class="searchterm"> &nbsp;"{{=query}}" > </span> </span> </div> </script>  </div> <div id="service-nav"> <div class="nav-menu signed-in-only" id="signed-in-nav" style=""> <div id="settings-nav-item"> <div class="down-arrow"></div> <div class="wheel"></div> </div> </div> <div class="signed-out-only" id="signed-out-nav" style="display: none;"> <a href="/authentication/login" id="login-link">Sign In</a> </div> </div> <div class="nav-menu" id="header-nav"> <div class="nav-item" id="nav-browse"> <div class="nav-item-inner"> <a alt="Browse" class="ajax" href="/browse"> Browse </a> </div> </div> <div class="nav-item" id="nav-featured"> <div class="nav-item-inner"> <a alt="Featured" class="ajax" href="/blog/all"> Featured </a> </div> </div> <div class="nav-item" id="nav-my-music"> <div class="nav-item-inner"> <a alt="My Music" class="ajax" href="/members/t0n6e4"> My Music </a> </div> </div> <div class="nav-item" id="nav-my-music-signed-out"> <div class="nav-item-inner"> <a alt="My Music" href="/my_music"> My Music </a> </div> </div> <div class="nav-item" id="nav-radio"> <div class="nav-item-inner"> <a alt="Radio" class="ajax" href="/radio"> Radio </a> </div> </div> </div> </div> </div> </div> <div id="settings-menu"> <div id="settings-menu-top"> <div class="title">anair@rhapsody.com</div> <div class="down-arrow"></div> <div class="wheel"></div> </div> <div id="settings-menu-dropdown"> <a href="/account" target="_blank">My Account</a> <div class="premier-upgrade" style="display:none"> <a href="/0d-prem" target="_blank">Upgrade Account</a> </div> <div id="nav-device-sync" style="display:none"> <a href="/devicesync">Device Sync</a> </div> <div id="take-the-tour">Take The Tour</div> <a href="/authentication/logout" id="logout-link">Sign Out</a> </div> </div>  <div id="middle"> <div id="player-queue-frame"> <div id="player-queue" style="border-top-left-radius: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px; border-bottom-left-radius: 0px; height: 320px;"> <div class="player-small" id="player"> <div id="player-upsell"> These are 30-second samples. <a href="/freetrial/player">Start a free trial</a> to hear full songs. </div> <div id="player-upsell-expired"> These are 30-second samples. <a href="/0d">Sign up now</a> to hear full songs. </div> <div id="player-trial-countdown"></div> <div id="player-error" style="height: 104px;"> <div id="player-error-background" style="height: 124px;"></div> <div id="player-error-message"></div> <div id="player-error-countdown"></div> <div id="player-error-button"></div> </div> <div id="player-info"> <div id="player-settings"> <div id="player-volume" title="Volume"></div> <div id="player-status" style="display: block;"></div> <div id="player-repeat" title="Repeat is on" class="selected"></div> <div id="player-shuffle" title="Shuffle is off"></div> <div id="player-volume-slider" class="ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all"><a class="ui-slider-handle ui-state-default ui-corner-all" href="#" style="left: 50%;"></a></div> </div> <div id="player-album"> <div id="player-album-thumbnails"> <div id="player-album-thumbnails-container"> <div class="player-album-thumbnail cover0" style="left: 0px; visibility: visible;"> <a class="ajax" href=""> <img src="/assets/layout/blank.png" title="" class="blank" style=""> </a> </div> <div class="player-album-thumbnail cover1" style="left: 134px; visibility: visible;"> <a class="ajax" href="/artist/ultimate-dance-hits/album/1-dance-80s--90s/track/manic-monday-remix"> <img title="#1 Dance 80s + 90s, Ultimate Dance Hits" src="http://static.rhap.com/img/170x170/9/1/5/2/2732519_170x170.jpg" style=""> </a> </div> <div class="player-album-thumbnail cover2" style="left: 268px; visibility: visible;"> <a class="ajax" href="/artist/90s-pop-band/album/90s-pop-music/track/nothing-compares-to-you"> <img title="90"s Pop Music, 90"s Pop Band" src="http://static.rhap.com/img/170x170/8/7/0/2/3752078_170x170.jpg"> </a> </div> <div class="player-album-thumbnail cover3" style="left: 402px; visibility: visible;"> <a class="ajax" href="/artist/90s-pop-band/album/90s-pop-music/track/the-locomotion"> <img src="http://static.rhap.com/img/170x170/8/7/0/2/3752078_170x170.jpg" title="90"s Pop Music, 90"s Pop Band" style=""> </a> </div> <div class="player-album-thumbnail cover4" style="left: 536px; visibility: visible;"> <a class="ajax" href=""> <img src="/assets/layout/blank.png" title="" class="blank" style=""> </a> </div> </div> </div> <div id="player-transport-controls"> <div id="player-previous" title="Manic Monday (Remix), Ultimate Dance Hits"></div> <div id="player-pause" title="Pause" style="display: none;"></div> <div id="player-play" title="Play" style=""></div> <div id="player-next" title="The Locomotion, 90"s Pop Band"></div> </div> </div> <div id="player-track-info" style="display: block;"> <div id="player-options" title="More Options" style=""></div> <div id="player-favorite" style="" title="Favorites"></div> <div id="player-track"> <a class="ajax" href="/artist/90s-pop-band/album/90s-pop-music/track/nothing-compares-to-you" id="player-track-link" title="Nothing Compares to You" style="">Nothing Compares to You</a> </div> <div id="player-artist"> <a class="ajax" href="/artist/90s-pop-band" id="player-artist-link" title="90"s Pop Band" style="">90"s Pop Band</a> <span id="player-artist-nolink" style="display: none;">90"s Pop Band</span> </div> </div> <div id="player-progress-frame"> <div id="player-current-time" title="Current track time" style="">0:00</div> <div id="player-total-time" title="Total track time" style="">4:53</div> <div id="player-progress" title="Seek"> <div id="player-progress-indicator" title="Progress"></div> </div> </div> </div> <div id="player-queue-next"> <div id="player-queue-track"> <!-- #player-manage-queue{:title => "Manage your queue"} --> <!-- #player-next-track-index --> </div> <div id="player-queue-radio"> <div id="player-radio-close" title="Stop Radio"></div> <div id="player-radio-info">&nbsp;</div> </div> </div> <script type="text/javascript">   //<![CDATA[     // Client requires fixed path urls for images, do not change     var defaultCover = "/assets/logos/rhapsody_no_album_image.png";     var blankCover = "/assets/layout/blank.png";         Locale.playerMessage = {       playInterrupted: "We"re sorry, playback was interrupted because of a network problem. Playback will continue momentarily.",       connectionFailed: "We"re sorry, we"re having trouble getting you connected. Please check your network connection and try again in a moment.",       playFailed: "We"re sorry, we were unable to play this track. Playback will continue automatically in a moment.",       notFound: "We"re sorry, we were unable to locate this track. Playback will continue automatically in a moment.",       networkDropped: "We"re sorry, playback was interrupted because of a network problem. Please check your network connection and try again in a moment.",       connected: "Loading...",       buttonOk: "OK",       buttonContinue: "Continue",       bufferEmpty: "Loading, one moment...",       connecting: "Connecting...",       unsupportedVersion: "You are using an unsupported version of Adobe Flash Player, please upgrade to the",       latestVersion: "latest version",       repeatIsOn: "Repeat is on",       repeatIsOff: "Repeat is off",       shuffleIsOn: "Shuffle is on",       shuffleIsOff: "Shuffle is off",       previousTrack: "Previous track",       nextTrack: "Next track",       deleteTrack: "Delete Track",       starting: "Starting...",       radio: "Radio",       artistRadio: "%{artist_name} Radio",       unsupportedAccountType: "We"re sorry, but free playback is not currently supported. You must be a Rhapsody subscriber to use this application.",       tryRhapsody: "Try Rhapsody",       invalidToken: "We"re sorry, we were unable to initiate your playback session. Please sign out and back in to create a new one.",       noContentAvailable: "We"re sorry, we couldn"t locate any information about this track. Playback will continue automatically in a moment.",       unhandledError: "We"re sorry, an error has occurred:",       accountNotCreated: "We"re sorry, we were unable to initiate your playback session. Please try again momentarily.",       loadTrackContentError: "We"re sorry, there was a problem loading the track you requested. Playback will continue automatically in a moment.",       loadNextTrackContentErrorMember: "Radio is not available. Not enough member listening history.",       loadNextTrackContentError: "We"re sorry, there was a problem connecting to %{station_name}. Please try again momentarily.",       geoBlocked: "We"re sorry. We have detected that you are outside of our service area. We apologize, but this service is currently only available to residents of the US, UK and Germany.",       playerError: "We"re sorry, an error has occurred:",       playbackSessionExpired: "It looks like your Rhapsody account is being used in another location. Click OK to continue.",       flashUnavailable: "It looks like you"re missing the Flash player, or your Flash plug-in is disabled. rhapsody.com requires the Flash player for audio streaming.",       getFlash: "Get Flash",       endFreePlay: "You"ve reached the end of your free-play limit!  Join Rhapsody now for the full experience, or feel free to continue enjoying 30-second samples.",       nowPlaying: "Now Playing:",       continuing: "Continuing...",       continuingIn: "Continuing in",       second: "second",       seconds: "seconds",       rhapsodyPlayer: "Rhapsody Player -",       mixerTracks: "Mixer Tracks",       streamingError: "We"re sorry, this track cannot be played because of licensing restrictions."     };   //]]> </script>  </div> <div id="queue" class="queue-loaded"> <div id="queue-slider"> <div id="queue-bridge"></div> <div id="queue-overlay" style="opacity: 1;"> <div id="queue-pointer-top" style="display: none;"> <div class="box"> <div class="arrow"></div> </div> </div> <div id="queue-pointer-bottom" style="display: none;"> <div class="box"> <div class="arrow"></div> </div> </div> <div id="queue-header"> <div id="queue-minified"> (hover to expand) </div> <div id="queue-title">Mixer</div> <div id="queue-close">Close</div> <div class="queue-control" id="queue-clear" title="Clear the mixer">Clear</div> <div class="queue-control" id="queue-save" title="Save the contents of the mixer as a playlist">Save as Playlist</div> </div> <div id="queue-frame"> <div id="queue-frame-content"> <div id="queue-message-container" style="display: none;"> <div class="queue-message">When you play a song it will show up here. You can rearrange the order of these songs by dragging them into position.</div> </div> <ul id="queue-container" class="ui-sortable"><li id="Tra.50188373"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:46</div><div class="track-title">Manic Monday (Remix)</div><div class="artist-name">Ultimate Dance Hits</div></div></li><li id="Tra.71075814" class="selected"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:53</div><div class="track-title">Nothing Compares to You</div><div class="artist-name">90"s Pop Band</div></div></li><li id="Tra.71075815"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">3:14</div><div class="track-title">The Locomotion</div><div class="artist-name">90"s Pop Band</div></div></li><li id="Tra.71075826"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">3:55</div><div class="track-title">Can You Feel the Love Tonight</div><div class="artist-name">90"s Pop Band</div></div></li><li id="Tra.28886096"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:00</div><div class="track-title">Karma Chameleon</div><div class="artist-name">Culture Club</div></div></li><li id="Tra.28886104"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">3:51</div><div class="track-title">Straight Up (Single Version)</div><div class="artist-name">Paula Abdul</div></div></li><li id="Tra.50237190"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:04</div><div class="track-title">Midnight City</div><div class="artist-name">M83</div></div></li><li id="Tra.104800678"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">5:56</div><div class="track-title">Oblivion (feat. Susanne Sundfør)</div><div class="artist-name">M83</div></div></li><li id="Tra.30229476"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">2:07</div><div class="track-title">Intro</div><div class="artist-name">The xx</div></div></li><li id="Tra.52506024"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:10</div><div class="track-title">People Lie All The Time</div><div class="artist-name">Trent Reznor / Atticus Ross</div></div></li><li id="Tra.46725280"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">5:14</div><div class="track-title">Clair de Lune - Debussy</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725283"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">2:55</div><div class="track-title">Beethoven - Piano Sonata 09 opus 14</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725281"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">3:06</div><div class="track-title">Beethoven Ode to Joy</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725284"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">3:40</div><div class="track-title">Erik Satie - Gymnopedie n.1</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725286"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">1:37</div><div class="track-title">Mozart - Ave Verum</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725282"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">3:51</div><div class="track-title">Brahms Lullaby</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725285"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">2:17</div><div class="track-title">Bach Air on the G String</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725287"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:14</div><div class="track-title">Fur Elise - Beethoven Music</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725289"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">1:20</div><div class="track-title">Chopin - Nocturne</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725291"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">5:29</div><div class="track-title">Erik Satie - Gymnopédie No.2</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725302"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">3:05</div><div class="track-title">Pachelbel - Canon in D</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725288"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">5:33</div><div class="track-title">Mozart - Eine Kleine Nachtmusik (A Little Night Music)</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725294"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">1:31</div><div class="track-title">Auld Lang Syne</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725307"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:04</div><div class="track-title">Johann Sebastian Bach - Book 1 - Fugue 02</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725299"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:21</div><div class="track-title">Beethoven - Sonata Pathetique</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725290"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">3:53</div><div class="track-title">Albinoni Adagio (1st part)</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725297"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:01</div><div class="track-title">Liszt - Hungarian Rhapsodies 1885 n.12</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725295"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">3:31</div><div class="track-title">Grieg Solveig"s Song from Peer Gynt Suite n2</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725305"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:50</div><div class="track-title">Grieg - Arietta</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725333"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">1:33</div><div class="track-title">Plaisirs d"Amour - Martini</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725332"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">7:34</div><div class="track-title">Chopin - Preludes n.13 Opus 28 Music Meditation</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725292"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">0:43</div><div class="track-title">Jesu, Joy of Man"s Desiring</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725323"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:37</div><div class="track-title">Bach - Celli Suite Solo Piano Music</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725293"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">1:43</div><div class="track-title">Carol of the Bells</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725308"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">1:30</div><div class="track-title">Greensleeves</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725304"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:28</div><div class="track-title">Johann Sebastian Bach - Book 1 - Fugue 10</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725321"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">8:28</div><div class="track-title">Schumann - Album for the young Opus 68 - The Happy Farmer</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725306"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">7:16</div><div class="track-title">Liszt - Love Dreams n.3</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725298"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">7:57</div><div class="track-title">Johann Sebastian Bach - Book 1 - Fugue 14 with Relaxing Nature Sounds</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725341"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:57</div><div class="track-title">Schumann - Scenes from Childhood Opus 15 - curious story Meditation Music</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725312"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:21</div><div class="track-title">Liszt - Nocturne n.3</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725313"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">6:24</div><div class="track-title">Robert Schumann - Kreisleriana Opus 16 1838</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725324"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">2:49</div><div class="track-title">Debussy - Beau Soir</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725336"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">6:30</div><div class="track-title">Haydn - Piano Sonata in G major Hoboken XVI40 Music Relax (1st part)</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725303"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">2:16</div><div class="track-title">Gounod - Ave Maria</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725301"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">1:25</div><div class="track-title">Amazing Grace</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725300"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:56</div><div class="track-title">Mozart - Sonata No. 16 C major (Sonata facile) , KV 545 (1788) 1 allegro</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725296"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">3:41</div><div class="track-title">Brahms - Hungarian Dances</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725325"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">1:23</div><div class="track-title">Bach - Minuet in G Major</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725310"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:27</div><div class="track-title">Grieg - In the Hall of the Mountain King</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725335"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">2:32</div><div class="track-title">Mozart Variations on Sonata K331 Classic Music</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725319"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">1:37</div><div class="track-title">Grieg - Morning Mood</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725317"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">7:41</div><div class="track-title">Beethoven - Sonate 01 Opus 2 with Gentle Bird Sounds for Meditation Relaxation</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725309"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">8:20</div><div class="track-title">Chopin - Nocturnes op 27 2</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725311"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">3:55</div><div class="track-title">Amazing Grace - New Age Music Version</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725314"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">2:34</div><div class="track-title">Chopin-Prelude n.9 Opus 28</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725320"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">3:42</div><div class="track-title">Pachelbel Canon in D New Age Music Edit</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725327"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:16</div><div class="track-title">Schumann - Scenes from Childhood Opus 15 - almost too serious Classical Wedding Music</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725334"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">4:48</div><div class="track-title">Schubert - Ave Maria Music Relaxation</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li><li id="Tra.46725322"><div class="track"><a href="/queue/delete" title="Delete Track" class="queue-delete">Remove</a><div class="queue-options">Options</div><div class="duration">2:03</div><div class="track-title">God Rest You Merry, Gentleman</div><div class="artist-name">Classical Music for Relaxation and Meditation Academy</div></div></li></ul> </div> </div> </div> </div>  </div> <div ad_bucket="/ads/billboard" id="billboard"> <div class="ad-content"></div> </div> <div id="upsell" style="border-radius: 0;"> <div id="upsell-toggle">Close</div> <div id="upsell-content">    <style>  .upsell-message {margin: 0; height: 118px; width: 305px; background: #657481; overflow: hidden}   .upsell-message-header {height: 28px; } .upsell-message-title {padding: 5px 0 0 5px; color: #FFF } .upsell-message-title a:link, .upsell-message-title a:visited {color: #FFF } .upsell-message-title a:hover {color: #ffb441;; } .upsell-message-text {overflow: hidden; padding: 5px; position: relative; height: 80px} .upsell-message-text h3 {font-size: 0.9em; margin: 8px 20px 0 20px; } .upsell-message-text p {color: #E4E4E4; margin: 0; font-size: 0.9em; }  .upsell-message-text img {float: left; margin-right: 10px; border: 0}  .upsell-message-text .more {display: block}       .upsell-message .upsell-message-text a:link, .upsell-message .upsell-message-text a:visited {         color: #FF9B00;  }  .upsell-message .upsell-message-text a:hover {         color: white;  }  .the-mix {  background: #657481 url(/messagecenter/mix_water_mark.png) no-repeat 210px 25px; }  </style> <div id="upsell-messages">  <!-- <div class="upsell-message" style="display:none">   <div class="upsell-message-header">       <div class="upsell-message-title">       <a href="https://www.facebook.com/Rhapsody/app_492385437455546?lsrc=mktg_rtdsweeps" target="_blank">         Rhapsody Anniversary Sweepstakes       </a>      </div>   </div>   <div class="upsell-message-text">     <p>       <a href="https://www.facebook.com/Rhapsody/app_492385437455546?lsrc=mktg_rtdsweeps"><img src="http://static.rhap.com/img/rn/img/2/3/7/5/65485732.jpg" height="70" width="70" /></a>           Win a $2,500 StubHub gift card through our Rock the Decade Facebook giveaway! 	</p> 	<a href="https://www.facebook.com/Rhapsody/app_492385437455546?lsrc=mktg_rtdsweeps" class="more">Go</a>   </div> </div> -->  <div class="upsell-message" style="display: none;">   <div class="upsell-message-header">       <div class="upsell-message-title">       <a href="/album/Alb.110679377" target="_blank">         Album of the Day       </a>      </div>   </div>   <div class="upsell-message-text">     <p>       <a href="/album/Alb.110679377"><img src="http://static.rhap.com/img/170x170/3/5/7/3/4173753_170x170.jpg" height="70" width="70"></a> 	<i>Ghost Brothers of Darkland Country</i> brings out stars from John Mellencamp to Rosanne Cash.        </p> 	<a href="/album/Alb.110679377" class="more">Play It Now</a>   </div> </div>   <div class="upsell-message" style="display: none;">   <div class="upsell-message-header">       <div class="upsell-message-title">       <a href="/blog/post/artist-spotlight-eagles?lsrc=blg_mc_as_eagles" target="_blank">         Artist Spotlight: Eagles       </a>      </div>   </div>   <div class="upsell-message-text">     <p>       <a href="/blog/post/artist-spotlight-eagles?lsrc=blg_mc_as_eagles"><img src="http://static.rhap.com/img/170x170/1/7/6/9/2339671_170x170.jpg" height="70" width="70"></a> 	"Take It Easy," "Hotel California" and other unforgettable hits.     </p> 	<a href="/blog/post/artist-spotlight-eagles?lsrc=blg_mc_as_eagles" class="more">Go</a>   </div> </div>  <div class="upsell-message" style="">   <div class="upsell-message-header">       <div class="upsell-message-title">       <a href="/blog/post/top-20-metal-albums-june-2013?lsrc=blg_mc_ru_metal06" target="_blank">         Top 20 Metal Albums       </a>      </div>   </div>   <div class="upsell-message-text">     <p>       <a href="/blog/post/top-20-metal-albums-june-2013?lsrc=blg_mc_ru_metal06"><img src="http://static.rhap.com/img/170x170/7/8/0/1/4161087_170x170.jpg" height="70" width="70"></a> 	Blood Ceremony, Kadavar, Black Sabbath and more killer metal picks.     </p> 	<a href="/blog/post/top-20-metal-albums-june-2013?lsrc=blg_mc_ru_metal06" class="more">Go</a>   </div> </div>   <div class="upsell-message" style="display: none;">   <div class="upsell-message-header">       <div class="upsell-message-title">       <a href="/blog/post/noize-rap-for-yeezus-freakz?lsrc=blg_mc_pl_noizerap" target="_blank">         Noize Rap for <i>Yeezus</i> Freakz       </a>      </div>   </div>   <div class="upsell-message-text">     <p>       <a href="/blog/post/noize-rap-for-yeezus-freakz?lsrc=blg_mc_pl_noizerap"><img src="http://static.rhap.com/img/170x170/1/0/4/0/2520401_170x170.jpg" height="70" width="70"></a> 	Dark, heavy, ear-rattling cuts for fans of Kanye"s latest noize experiment.     </p> 	<a href="/blog/post/noize-rap-for-yeezus-freakz?lsrc=blg_mc_pl_noizerap" class="more">Go</a>   </div> </div>       </div>     </div> </div> </div> </div> <div id="noticebox" style="display:none"> <div id="notice"></div> </div> <noscript> &lt;div class="warning" id="noscript_notice"&gt; JavaScript is disabled in your browser settings. rhapsody.com requires JavaScript. &lt;/div&gt; </noscript> <div id="main-container"> <div id="actionmessagebox-center"> <div id="actionmessagebox" style="display: none;"> <div id="actionmessage" class="loading">Loading…</div> </div> </div> <div id="tophat-upsell" style="display:none"> <div id="tophat-upsell-content"></div> </div> <div id="tour-container" style="display:none"> <div id="tour-content"></div> <div class="close-button"></div> <div class="next-button"></div> </div> <div ad_bucket="/ads/tophat" id="tophat" style="display: none;"> <div class="ad-content"></div> </div> <div id="main-frame" style="height: 83px;"> <div id="main-frame-content"> <div id="main"><div id="main-content" style=""> <div id="welcome-page"> <div id="content-frame" style="height: 290px;"> <div class="subscriber"> <div id="top-section"> <div id="left-column"> <div id="social-profile"> <div class="header"> <h4 class="header-title"> <a class="ajax" href="/members/t0n6e4">Music Profile</a> </h4> </div> <div id="facebook-connect-container" style="margin-top: 7px"> <div id="welcome-facebook-connect-button"></div> </div> <div class="fb-not-connected-message"> <div class="welcome-create-profile">Edit profile</div> </div> </div> <div id="genre-list"> <div id="my-genres"> <div class="header"> <h4 class="header-title"> <a class="ajax" href="/genre"> My Genres </a> </h4> <div class="more"> <a href="/genre" alt="More genres" class="ajax" title="More genres">More</a> </div> </div> <ul> <li class="genre-item" genre_id="g.21" genre_name="Classical"> <a class="ajax" href="/genre/classical"> Classical </a> </li> <li class="genre-item" genre_id="g.135" genre_name="House"> <a class="ajax" href="/genre/electronica-dance/house"> House </a> </li> <li class="genre-item" genre_id="g.115" genre_name="Pop"> <a class="ajax" href="/genre/rock-pop/pop"> Pop </a> </li> <li class="genre-item" genre_id="g.169" genre_name="Dream Pop"> <a class="ajax" href="/genre/alt-punk/indie-alternative/dream-pop"> Dream Pop </a> </li> <li class="genre-item" genre_id="g.246" genre_name="Soundtracks/Musicals"> <a class="ajax" href="/genre/soundtracks-musicals"> Soundtracks/Musicals </a> </li> <li class="genre-item" genre_id="g.290" genre_name="Dance Pop"> <a class="ajax" href="/genre/rock-pop/pop/dance-pop"> Dance Pop </a> </li> <li class="genre-item" genre_id="g.305" genre_name="Film Scores"> <a class="ajax" href="/genre/soundtracks-musicals/film-scores"> Film Scores </a> </li> <li class="genre-item" genre_id="g.197" genre_name="Soundtracks"> <a class="ajax" href="/genre/soundtracks-musicals/soundtracks"> Soundtracks </a> </li> <li class="genre-item" genre_id="g.168" genre_name="Brit Rock"> <a class="ajax" href="/genre/alt-punk/brit-pop-brit-rock/brit-rock"> Brit Rock </a> </li> <li class="genre-item" genre_id="g.160" genre_name="Novelty"> <a class="ajax" href="/genre/comedy-spoken-word/novelty"> Novelty </a> </li> <li class="genre-item" genre_id="g.241" genre_name="New Wave"> <a class="ajax" href="/genre/alt-punk/new-wave"> New Wave </a> </li> <li class="genre-item" genre_id="g.293" genre_name="Acoustic Blues"> <a class="ajax" href="/genre/blues/acoustic-blues"> Acoustic Blues </a> </li> <li> <a class="ajax" href="/genre"> more... </a> </li> </ul> </div> </div> </div> <div class="feature-module" feature="Home, New Releases" id="new-releases"> <div class="header"> <h4 class="header-title"> <a class="ajax" href="/album/newreleases">New Releases</a> </h4> <div class="more"> <a href="/album/newreleases" alt="More new releases" class="ajax" title="More new releases">More</a> </div> </div> <div album_id="Alb.113160345" album_name="Their Greatest Hits (1971-1975)" album_shortcut="their-greatest-hits-1971-1975-rhinoelektra" artist_id="Art.346" artist_name="Eagles" artist_shortcut="eagles" class="album album-item album-grid-item" href="/artist/eagles/album/their-greatest-hits-1971-1975-rhinoelektra" itemprop="album" itemscope="itemscope" itemtype="http://schema.org/MusicAlbum" rights="33594"> <meta content="/artist/eagles/album/their-greatest-hits-1971-1975-rhinoelektra" itemprop="url"> <div class="albumart-controls"> <a class="album-image ajax" href="/artist/eagles/album/their-greatest-hits-1971-1975-rhinoelektra" title="Their Greatest Hits (1971-1975)"> <img alt="thumbnail" height="130" itemprop="image" src="http://static.rhap.com/img/170x170/7/8/2/2/4262287_170x170.jpg" title="Their Greatest Hits (1971-1975)" width="130"> </a> <div class="play-button" style="display:none"> <a title="Play Album"> Play </a> </div> <div class="options-button" style="display:none"> <a title="More Options"> Options </a> </div> </div> <h2 class="title" itemprop="name"> <a class="ajax" href="/artist/eagles/album/their-greatest-hits-1971-1975-rhinoelektra" title="Their Greatest Hits (1971-1975)"> Their Greatest Hits (1971-1975) </a>  </h2> <div class="artist"> <a class="ajax" href="/artist/eagles"> Eagles </a>  </div> </div> <div album_id="Alb.113813714" album_name="The Gifted" album_shortcut="the-gifted-mmgatlantic" artist_id="Art.19296513" artist_name="Wale" artist_shortcut="wale" class="album album-item album-grid-item" href="/artist/wale/album/the-gifted-mmgatlantic" itemprop="album" itemscope="itemscope" itemtype="http://schema.org/MusicAlbum" rights="33594"> <meta content="/artist/wale/album/the-gifted-mmgatlantic" itemprop="url"> <div class="albumart-controls"> <a class="album-image ajax" href="/artist/wale/album/the-gifted-mmgatlantic" title="The Gifted"> <img alt="thumbnail" height="130" itemprop="image" src="http://static.rhap.com/img/170x170/4/6/6/9/4269664_170x170.jpg" title="The Gifted" width="130"> </a> <div class="play-button" style="display:none"> <a title="Play Album"> Play </a> </div> <div class="options-button" style="display:none"> <a title="More Options"> Options </a> </div> </div> <h2 class="title" itemprop="name"> <a class="ajax" href="/artist/wale/album/the-gifted-mmgatlantic" title="The Gifted"> The Gifted </a>  <span class="album-type">(Explicit)</span> </h2> <div class="artist"> <a class="ajax" href="/artist/wale"> Wale </a>  </div> </div> <div album_id="Alb.113483580" album_name="SongVersation" album_shortcut="songversation-motown-records-2013" artist_id="Art.37897" artist_name="India.Arie" artist_shortcut="indiaarie" class="album album-item album-grid-item" href="/artist/indiaarie/album/songversation-motown-records-2013" itemprop="album" itemscope="itemscope" itemtype="http://schema.org/MusicAlbum" rights="33594"> <meta content="/artist/indiaarie/album/songversation-motown-records-2013" itemprop="url"> <div class="albumart-controls"> <a class="album-image ajax" href="/artist/indiaarie/album/songversation-motown-records-2013" title="SongVersation"> <img alt="thumbnail" height="130" itemprop="image" src="http://static.rhap.com/img/170x170/1/6/2/1/4241261_170x170.jpg" title="SongVersation" width="130"> </a> <div class="play-button" style="display:none"> <a title="Play Album"> Play </a> </div> <div class="options-button" style="display:none"> <a title="More Options"> Options </a> </div> </div> <h2 class="title" itemprop="name"> <a class="ajax" href="/artist/indiaarie/album/songversation-motown-records-2013" title="SongVersation"> SongVersation </a>  <span class="album-type">(Bonus Tracks)</span> </h2> <div class="artist"> <a class="ajax" href="/artist/indiaarie"> India.Arie </a>  </div> </div>  </div> <div class="feature-module" feature="Home, Playlists" id="playlists"> <div class="header"> <h4 class="header-title"> <a href="/members/t0n6e4/playlists" class="ajax">My Playlists</a> </h4> <div class="more"> <a href="/members/t0n6e4/playlists" alt="More playlists" class="ajax" title="More playlists">More</a> </div> </div> <ul> <li class="playlist playlist-item" href="/members/t0n6e4/playlists/mp.171526417" playlist_id="mp.171526417" playlist_member_name="Member t0n6e4" playlist_name="Meditational"> <div class="play-button"> <a title="Play Playlist"> Play </a> </div> <div class="info"> <div class="name"> <a href="/members/t0n6e4/playlists/mp.171526417" class="ajax">Meditational</a> </div> </div> <div class="options-button"> <a title="More Options"> Options </a> </div> </li> <li class="playlist playlist-item" href="/members/t0n6e4/playlists/mp.172452648" playlist_id="mp.172452648" playlist_member_name="Member t0n6e4" playlist_name="anjulie"> <div class="play-button"> <a title="Play Playlist"> Play </a> </div> <div class="info"> <div class="name"> <a href="/members/t0n6e4/playlists/mp.172452648" class="ajax">anjulie</a> </div> </div> <div class="options-button"> <a title="More Options"> Options </a> </div> </li> <li class="playlist playlist-item" href="/members/t0n6e4/playlists/mp.171984405" playlist_id="mp.171984405" playlist_member_name="Member t0n6e4" playlist_name="Classical"> <div class="play-button"> <a title="Play Playlist"> Play </a> </div> <div class="info"> <div class="name"> <a href="/members/t0n6e4/playlists/mp.171984405" class="ajax">Classical</a> </div> </div> <div class="options-button"> <a title="More Options"> Options </a> </div> </li> <li class="playlist playlist-item" href="/members/t0n6e4/playlists/mp.171642671" playlist_id="mp.171642671" playlist_member_name="Member t0n6e4" playlist_name="Ellie Goulding"> <div class="play-button"> <a title="Play Playlist"> Play </a> </div> <div class="info"> <div class="name"> <a href="/members/t0n6e4/playlists/mp.171642671" class="ajax">Ellie Goulding</a> </div> </div> <div class="options-button"> <a title="More Options"> Options </a> </div> </li> <li class="playlist playlist-item" href="/members/t0n6e4/playlists/mp.171407437" playlist_id="mp.171407437" playlist_member_name="Member t0n6e4" playlist_name="Dance pop"> <div class="play-button"> <a title="Play Playlist"> Play </a> </div> <div class="info"> <div class="name"> <a href="/members/t0n6e4/playlists/mp.171407437" class="ajax">Dance pop</a> </div> </div> <div class="options-button"> <a title="More Options"> Options </a> </div> </li>  </ul> </div> </div> <div class="featured-on-rhapsody welcome-editorial" id="welcome-editorial"> <div class="header"> <h1 class="header-title"> <a class="ajax" href="/blog">Featured on Rhapsody</a> </h1> <div class="more"> <a href="/blog" alt="More Featured on Rhapsody" class="ajax" title="More Featured on Rhapsody">More</a> </div> </div> <div class="editorial-content" id="welcome-editorial-content"> <div class="feature-module" feature="Home, Featured" id="editorial"> <div class="post"> <div class="content"> <div class="embedded-media"> <a class="ajax" href="/blog/post/top-20-hip-hop-summer-2013"> <img onload="EditorialHelper.centerEmbeddedMediaImage(this);" src="http://direct.rhapsody.com/imageserver/v2/imagesets/imgs.115082407/images/500x500.jpg"> </a> <div class="controls playlist-item" href="/playlist/pp.114710791" playlist_id="pp.114710791" playlist_member_name="" playlist_name="Summer 2013 Rap Albums Sampler"> <div class="control-container inactive"> <div class="play-button"> <a title="Play Playlist">Play</a> </div> <div class="options-button"> <a title="More Options">Options</a> </div> <div class="description"> <a href="/playlist/pp.114710791" class="ajax description-text">Playlist</a> </div> </div> </div>  </div> <div class="post-title"> <a class="ajax" href="/blog/post/top-20-hip-hop-summer-2013">Top 20 Hip-Hop Releases, Summer 2013</a> </div> <div class="text">The hottest hip-hop hits of the summer, from Wale to J. Cole to that guy Kanye.</div> </div> </div> <div class="post"> <div class="content"> <div class="embedded-media"> <a class="ajax" href="/blog/post/the-50-best-songs-of-1994"> <img onload="EditorialHelper.centerEmbeddedMediaImage(this);" src="http://direct.rhapsody.com/imageserver/v2/imagesets/imgs.114720364/images/500x500.jpg"> </a> <div class="controls playlist-item" href="/playlist/pp.114309310" playlist_id="pp.114309310" playlist_member_name="" playlist_name="The 50: 1994"> <div class="control-container inactive"> <div class="play-button"> <a title="Play Playlist">Play</a> </div> <div class="options-button"> <a title="More Options">Options</a> </div> <div class="description"> <a href="/playlist/pp.114309310" class="ajax description-text">Playlist</a> </div> </div> </div>  </div> <div class="post-title"> <a class="ajax" href="/blog/post/the-50-best-songs-of-1994">The 50 Best Songs of 1994</a> </div> <div class="text">Beck, Hole, Warren G and more winners and "Losers" from "94.</div> </div> </div> <div class="post"> <div class="content"> <div class="embedded-media"> <a class="ajax" href="/blog/post/top-16-emo-punk-albums-june-2013"> <img onload="EditorialHelper.centerEmbeddedMediaImage(this);" src="http://direct.rhapsody.com/imageserver/v2/imagesets/imgs.114688885/images/500x500.jpg"> </a> <div class="controls playlist-item" href="/playlist/pp.114325460" playlist_id="pp.114325460" playlist_member_name="" playlist_name="Top Emo/Punk Releases, June 2013"> <div class="control-container inactive"> <div class="play-button"> <a title="Play Playlist">Play</a> </div> <div class="options-button"> <a title="More Options">Options</a> </div> <div class="description"> <a href="/playlist/pp.114325460" class="ajax description-text">Playlist</a> </div> </div> </div>  </div> <div class="post-title"> <a class="ajax" href="/blog/post/top-16-emo-punk-albums-june-2013">Top 16 Emo/Punk Albums, June 2013</a> </div> <div class="text">The best new jams from Sleeping With Sirens, The Wonder Years and more.</div> </div> </div> </div> </div> </div> <div class="feature-module" feature="Home, Popular" id="chart-tracks"> <div class="header"> <h4 class="header-title"> <a class="ajax" href="/chart/tracks">Popular</a> </h4> <div class="more"> <a href="/chart/tracks" alt="More" class="ajax" title="More">More</a> </div> </div> <div id="line"></div> <ul class="track-list"> <li album_id="Alb.98333272" album_shortcut="blurred-lines-single" artist_id="Art.7485163" artist_name="Robin Thicke" artist_shortcut="robin-thicke" class="track-item track-list-item" href="/artist/robin-thicke/album/blurred-lines-single/track/blurred-lines-featuring-ti-pharrell" itemprop="tracks" itemscope="itemscope" itemtype="http://schema.org/MusicRecording" previewurl="http://listen.vo.llnwd.net/g1/7/3/6/5/2/982125637.mp3" track_id="Tra.98333273" track_name="Blurred Lines featuring T.I., Pharrell" track_shortcut="blurred-lines-featuring-ti-pharrell"> <meta content="Blurred Lines featuring T.I., Pharrell" itemprop="name"> <meta content="/artist/robin-thicke/album/blurred-lines-single/track/blurred-lines-featuring-ti-pharrell" itemprop="url"> <meta content="PT263S" itemprop="duration"> <meta content="Blurred Lines" itemprop="inAlbum"> <span itemprop="audio" itemscope="itemscope"> <meta content="en-US" itemprop="regionsAllowed"> </span> <input class="id" type="hidden" value="Tra.98333273"> <div class="play-button"> <a title="Play Track"> Play </a> </div> <div class="index"> 1 </div> <div class="options-button"> <a title="More Options"> Options </a> </div> <div class="duration"> 4:23 </div> <div class="track"> <div class="truncated-name play-link"> <a href="/artist/robin-thicke/album/blurred-lines-single/track/blurred-lines-featuring-ti-pharrell">Blurred Lines featuring T.I., Pharrell</a> </div> <div class="name play-link"> <a href="/artist/robin-thicke/album/blurred-lines-single/track/blurred-lines-featuring-ti-pharrell">Blurred Lines featuring T.I., Pharrell</a> </div> <div class="artist"> <a class="ajax" href="/artist/robin-thicke"> Robin Thicke </a>  </div> </div> </li> <li album_id="Alb.64534116" album_shortcut="night-visions" artist_id="Art.41226138" artist_name="Imagine Dragons" artist_shortcut="imagine-dragons" class="track-item track-list-item" href="/artist/imagine-dragons/album/night-visions/track/radioactive" itemprop="tracks" itemscope="itemscope" itemtype="http://schema.org/MusicRecording" previewurl="http://listen.vo.llnwd.net/g1/7/9/8/9/2/982029897.mp3" track_id="Tra.64534117" track_name="Radioactive" track_shortcut="radioactive"> <meta content="Radioactive" itemprop="name"> <meta content="/artist/imagine-dragons/album/night-visions/track/radioactive" itemprop="url"> <meta content="PT186S" itemprop="duration"> <meta content="Night Visions" itemprop="inAlbum"> <span itemprop="audio" itemscope="itemscope"> <meta content="en-US" itemprop="regionsAllowed"> </span> <input class="id" type="hidden" value="Tra.64534117"> <div class="play-button"> <a title="Play Track"> Play </a> </div> <div class="index"> 2 </div> <div class="options-button"> <a title="More Options"> Options </a> </div> <div class="duration"> 3:06 </div> <div class="track"> <div class="truncated-name play-link"> <a href="/artist/imagine-dragons/album/night-visions/track/radioactive">Radioactive</a> </div> <div class="name play-link"> <a href="/artist/imagine-dragons/album/night-visions/track/radioactive">Radioactive</a> </div> <div class="artist"> <a class="ajax" href="/artist/imagine-dragons"> Imagine Dragons </a>  </div> </div> </li> <li album_id="Alb.112013274" album_shortcut="we-cant-stop" artist_id="Art.9557743" artist_name="Miley Cyrus" artist_shortcut="miley-cyrus" class="track-item track-list-item" href="/artist/miley-cyrus/album/we-cant-stop/track/we-cant-stop" itemprop="tracks" itemscope="itemscope" itemtype="http://schema.org/MusicRecording" previewurl="http://listen.vo.llnwd.net/g1/5/7/4/1/3/998431475.mp3" track_id="Tra.112013275" track_name="We Can"t Stop" track_shortcut="we-cant-stop"> <meta content="We Can"t Stop" itemprop="name"> <meta content="/artist/miley-cyrus/album/we-cant-stop/track/we-cant-stop" itemprop="url"> <meta content="PT232S" itemprop="duration"> <meta content="We Can"t Stop" itemprop="inAlbum"> <span itemprop="audio" itemscope="itemscope"> <meta content="en-US" itemprop="regionsAllowed"> </span> <input class="id" type="hidden" value="Tra.112013275"> <div class="play-button"> <a title="Play Track"> Play </a> </div> <div class="index"> 3 </div> <div class="options-button"> <a title="More Options"> Options </a> </div> <div class="duration"> 3:52 </div> <div class="track"> <div class="truncated-name play-link"> <a href="/artist/miley-cyrus/album/we-cant-stop/track/we-cant-stop">We Can"t Stop</a> </div> <div class="name play-link"> <a href="/artist/miley-cyrus/album/we-cant-stop/track/we-cant-stop">We Can"t Stop</a> </div> <div class="artist"> <a class="ajax" href="/artist/miley-cyrus"> Miley Cyrus </a>  </div> </div> </li> <li album_id="Alb.108853455" album_shortcut="random-access-memories" artist_id="Art.5060" artist_name="Daft Punk" artist_shortcut="daft-punk" class="track-item track-list-item" href="/artist/daft-punk/album/random-access-memories/track/get-lucky" itemprop="tracks" itemscope="itemscope" itemtype="http://schema.org/MusicRecording" previewurl="http://listen.vo.llnwd.net/g1/7/8/1/8/4/993448187.mp3" track_id="Tra.108853463" track_name="Get Lucky" track_shortcut="get-lucky"> <meta content="Get Lucky" itemprop="name"> <meta content="/artist/daft-punk/album/random-access-memories/track/get-lucky" itemprop="url"> <meta content="PT369S" itemprop="duration"> <meta content="Random Access Memories" itemprop="inAlbum"> <span itemprop="audio" itemscope="itemscope"> <meta content="en-US" itemprop="regionsAllowed"> </span> <input class="id" type="hidden" value="Tra.108853463"> <div class="play-button"> <a title="Play Track"> Play </a> </div> <div class="index"> 4 </div> <div class="options-button"> <a title="More Options"> Options </a> </div> <div class="duration"> 6:09 </div> <div class="track"> <div class="truncated-name play-link"> <a href="/artist/daft-punk/album/random-access-memories/track/get-lucky">Get Lucky</a> </div> <div class="name play-link"> <a href="/artist/daft-punk/album/random-access-memories/track/get-lucky">Get Lucky</a> </div> <div class="artist"> <a class="ajax" href="/artist/daft-punk"> Daft Punk </a>  </div> </div> </li> <li album_id="Alb.66023342" album_shortcut="the-heist" artist_id="Art.21379866" artist_name="Macklemore &amp; Ryan Lewis" artist_shortcut="macklemore" class="track-item track-list-item" href="/artist/macklemore/album/the-heist/track/cant-hold-us-feat-ray-dalton" itemprop="tracks" itemscope="itemscope" itemtype="http://schema.org/MusicRecording" previewurl="http://listen.vo.llnwd.net/g1/7/6/6/7/4/993447667.mp3" track_id="Tra.66023344" track_name="Can"t Hold Us (feat. Ray Dalton)" track_shortcut="cant-hold-us-feat-ray-dalton"> <meta content="Can"t Hold Us (feat. Ray Dalton)" itemprop="name"> <meta content="/artist/macklemore/album/the-heist/track/cant-hold-us-feat-ray-dalton" itemprop="url"> <meta content="PT258S" itemprop="duration"> <meta content="The Heist" itemprop="inAlbum"> <span itemprop="audio" itemscope="itemscope"> <meta content="en-US" itemprop="regionsAllowed"> </span> <input class="id" type="hidden" value="Tra.66023344"> <div class="play-button"> <a title="Play Track"> Play </a> </div> <div class="index"> 5 </div> <div class="options-button"> <a title="More Options"> Options </a> </div> <div class="duration"> 4:18 </div> <div class="track"> <div class="truncated-name play-link"> <a href="/artist/macklemore/album/the-heist/track/cant-hold-us-feat-ray-dalton">Can"t Hold Us (feat. Ray Dalton)</a> </div> <div class="name play-link"> <a href="/artist/macklemore/album/the-heist/track/cant-hold-us-feat-ray-dalton">Can"t Hold Us (feat. Ray Dalton)</a> </div> <div class="artist"> <a class="ajax" href="/artist/macklemore"> Macklemore &amp; Ryan Lewis </a>  </div> </div> </li>  </ul> </div> </div> </div> <div class="page-metadata" meta_site_section="home" style="display:none"></div>  </div>  </div></div> </div> </div> </div> </div> <div id="footer"> <div id="footer">   <div id="footer-frame">     <ul id="footer-menu">       <li class="foot-menu">         <div class="foot-item">           <a href="/" class="top-nav no-link">Subscriptions</a>         </div>         <ul>           <li>             <a target="_blank" href="/what-is-rhapsody">What Is Rhapsody</a>           </li>           <li>             <a target="_blank" href="/freetrial">Free Trial</a>           </li>           <li>             <a target="_blank" href="https://order.rhapsody.com/rhapsody/coupons/rewards?lsrc=rhapnew">Coupon Redemption</a>           </li>           <li>             <a href="/gift/buy" target="_blank">Gift</a>           </li>           <li>             <a id="redeem" href="https://account.rhapsody.com/" target="_blank">Gift Redeem</a>           </li>           <li>             <a target="_blank" href="https://order.rhapsody.com/rhapsody/free/real?src=rcom_foot">Rhapsody Software</a>           </li>         </ul>       </li>       <li class="foot-menu">         <div class="foot-item">           <a href="/" class="top-nav no-link">Compatible Devices</a>         </div>         <ul>           <li>             <a target="_blank" href="/what-is-rhapsody/devices.html?t=device&amp;v=Phone">Phone</a>           </li>           <li>             <a target="_blank" href="/what-is-rhapsody/devices.html?t=device&amp;v=Home Audio">Home Audio</a>           </li>           <li>             <a target="_blank" href="/what-is-rhapsody/where.html?id=macpc">Mac or PC</a>           </li>           <li>             <a target="_blank" href="/what-is-rhapsody/devices.html?t=device&amp;v=TV">TV</a>           </li><li>             <a target="_blank" href="/what-is-rhapsody/where/tabletapps">Tablets</a>           </li>           <li>             <a target="_blank" href="/what-is-rhapsody/where.html?id=cars">Cars</a>           </li>           <li>             <a target="_blank" href="/what-is-rhapsody/devices.html?t=device&amp;v=MP3 player">MP3 Players</a>           </li>         </ul>       </li>       <li class="foot-menu">         <div class="foot-item">           <a href="/" class="top-nav no-link">About</a>         </div>         <ul>           <li>             <a target="_blank" href="/about/index.html">Company Info</a>           </li>           <li>             <a target="_blank" href="http://news.rhapsody.com">Blog</a>           </li>           <li>             <a target="_blank" href="/about/careers.html">Careers</a>           </li>          <!--          <li>             <a target="_blank" href="http://www.rhapsody.com/advertise/index.html">Advertise</a>           </li>           -->           <li>             <a target="_blank" href="/sponsorships">Sponsorships</a>           </li>         </ul>       </li>       <li class="foot-menu">         <div class="foot-item">           <a href="/" class="top-nav no-link">Terms</a>         </div>         <ul>           <li>             <a target="_blank" href="/rhapeula?lsrc=rhapnew">EULA</a>           </li>           <li>             <a target="_blank" href="/terms_of_use">Terms of Use</a>           </li>           <li>             <a target="_blank" href="/privacy_policy?lsrc=rhapnew">Privacy Policy</a>           </li>         </ul>       </li>       <li class="foot-link">         <div class="foot-item">           <a href="/refer" target="_blank" class="top-nav">Refer a Friend</a>         </div>       </li>       <script>       	if(typeof(Account) != "undefined" && Account.isLoggedIn())       		document.getElementById("redeem").href = "https://account.rhapsody.com/";       	else       		document.getElementById("redeem").href = "http://www.rhapsody.com/gift/redeem";       </script>       <li class="foot-link">         <div class="foot-item">           <a target="_blank" href="/support" class="top-nav">Help</a>         </div>       </li>     </ul>     <div id="footer-follow">       <span class="label">Follow us:</span>       <a title="Follow Rhapsody on Facebook" target="_blank" href="http://www.facebook.com/Rhapsody?v=wall" class="facebook"></a>       <a title="Follow Rhapsody on Twitter" target="_blank" href="http://twitter.com/rhapsody" class="twitter"></a>     </div>     <div id="footer-copyright">       © 2013 Rhapsody International     </div>     <div id="footer-mtv">       <a target="_blank" href="http://www.mtv.com">         <img width="72" height="14" title="MTV" src="http://www.rhapsody.com/assets/logos/mtv.png" alt="MTV">       </a>     </div>   </div> </div> </div>  <ul id="context-menu" style="display: none"> <li id="top-heading" style="display: none"></li> <li id="top-heading-swap" style="display: none"></li> <li id="top-heading-small" style="display: none"></li> <li class="first" id="view-link"><a href="#">View</a></li> <li class="first" id="queue-link"><a href="#">Add to Mixer</a></li> <li id="add-to-library-link"><a href="#">Add to Library</a></li> <li id="remove-from-library-link"><a href="#">Remove from Library</a></li> <li id="add-to-current-playlist-link"><a href="#" style="display: none">Add to "Current Playlist"</a></li> <li id="add-to-playlist-link"><a href="#">Add to Playlist…</a></li> <li id="copy-playlist-link" style="display: none"><a href="#">Add to My Playlists</a></li> <li id="download-link" style="display: none"><a href="#">Download Track</a></li> <li id="remove-download-link" style="display: none"><a href="#">Remove Download</a></li> <li class="share"> <span></span> <a class="google" id="share-on-google" title="Share on Google+"></a> <a class="facebook" id="share-on-facebook" title="Share on Facebook"></a> <a class="twitter" id="share-on-twitter" title="Share on Twitter"></a> <a class="email" id="share-via-email" title="Share a Link"></a> </li> <li id="bottom-heading" style="display: none"></li> <li id="bottom-heading-small" style="display: none"></li> </ul> <div class="nag-popup-small" id="free-play-nag-popup"> <div class="box"> <div class="top-arrow"></div> <div class="bottom-arrow"></div> <div class="box-content"> <div class="close-button"></div> <div class="content"> Sign-up to hear full length tracks! </div> <div class="try-button"> <a href="/14d">Try Rhapsody</a> </div> </div> </div> </div> <div class="nag-popup" id="free-queue-nag-popup"> <div class="box"> <div class="top-arrow"></div> <div class="bottom-arrow"></div> <div class="box-content"> <div class="close-button"></div> <h1>Add to Player Queue</h1> <h2>Sign In or Upgrade</h2> <p>To bookmark music using My Library or to create a Playlist, please sign in to Rhapsody.</p> <div class="question"> <p>Don"t have Rhapsody?</p> </div> <div class="try-button"> <a href="/14d">Try Rhapsody</a> </div> </div> </div> </div> <div class="nag-popup" id="radio-play-nag-popup"> <div class="box"> <div class="top-arrow"></div> <div class="bottom-arrow"></div> <div class="box-content"> <div class="close-button"></div> <h1>Radio</h1> <h2>Sign In or Upgrade</h2> <p>To listen to Rhapsody radio stations, please sign in to Rhapsody.</p> <div class="question"> <p>Don"t have Rhapsody?</p> </div> <div class="try-button"> <a href="/freetrial?cpath=radio_popup&amp;rsrc=radio_popup">Try Rhapsody</a> </div> </div> </div> </div> <div class="nag-popup" id="radio-play-expired-nag-popup"> <div class="box"> <div class="top-arrow"></div> <div class="bottom-arrow"></div> <div class="box-content"> <div class="close-button"></div> <h1>Radio</h1> <h2>Upgrade</h2> <p> To listen to Rhapsody artist radio stations, <a href="/0d">sign up now.</a> </p> </div> </div> </div> <div id="sidedoor-dialog"> <div class="close-button"></div> <div class="image"></div> <div class="content"> <div class="text"> <div class="listento-header"> Listen to Madonna </div> and thousands of other artists with Rhapsody </div> </div> <div class="try-button"> <a href="/freetrial/sidedoor"> <span>Try Rhapsody</span> </a> </div> <div class="continue-link"> <a id="continue-to-rhapsody" title="Continue to Rhapsody">Continue to Rhapsody &gt;</a> </div> </div> <div class="dialog-box" id="find-people-results-dialog" style="display: none"> <div class="dialog-title"> <div class="title"> Find Listeners </div> <div class="close-button"></div> </div> <div class="dialog-content"> <div class="error" style="display: none">There was an error communicating with the server. Please try again later.</div> </div> <div class="dialog-footer"> <div class="dialog-email"></div> <div class="dialog-buttons"> <a class="refer" href="/refer" style="" target="_blank">Refer a friend</a> <div class="button done">Ok</div> </div> </div> </div> <div class="dialog-box" id="add-to-playlist-dialog" style="display: none"> <div class="dialog-title"> <div class="title"> Add to Playlist </div> <div class="close-button"></div> </div> <div class="dialog-content"> <p class="text"></p> <div class="tabs"> <ul> <li class="existing-playlist-tab"> <a> My Playlists </a> </li> <li class="new-playlist-tab"> <a> New Playlist </a> </li> </ul> </div> <div class="tab-pages"> <div class="tab-page" id="existing-playlist-tab-page"> <select id="add-to-existing-playlist-list" name="playlist_list" size="15"></select> </div> <div class="tab-page" id="new-playlist-tab-page"> <input class="default" id="add-to-new-playlist-name" name="playlist_name" type="text" value="New Playlist Name"> </div> </div> </div> <div class="dialog-buttons"> <input class="button submit" name="playlist_add" type="button" value="Add"> <input class="button cancel" type="button" value="Cancel"> </div> </div> <div class="dialog-box" id="share-link-dialog" style="display: none"> <div class="dialog-title"> <div class="title"> Share a Link </div> <div class="close-button"></div> </div> <div class="dialog-content"> <p class="text"> Copy and paste the following: </p> <div class="share-link"> <input id="share-url" name="share-url" type="text" value=""> </div> </div> <div class="dialog-buttons"> <input class="button cancel" type="button" value="OK"> </div> </div> <div class="dialog-box" id="delete-playlist-dialog" style="display: none"> <div class="dialog-title"> <div class="title"> Delete Playlist </div> <div class="close-button"></div> </div> <div class="dialog-content"> <p class="text"> Delete this Playlist? </p> </div> <div class="dialog-buttons"> <input class="button submit" type="button" value="Delete"> <input class="button cancel" type="button" value="Cancel"> </div> </div> <div class="dialog-box" id="delete-library-tracks-dialog" style="display: none"> <div class="dialog-title"> <div class="title"> Delete Library Tracks </div> <div class="close-button"></div> </div> <div class="dialog-content"> <p class="text"> Delete these tracks? </p> </div> <div class="dialog-buttons"> <input class="button submit" type="button" value="Delete"> <input class="button cancel" type="button" value="Cancel"> </div> </div> <div id="queue-content-overlay"></div> <div class="dialog-box" id="version-update-reload-dialog" style="display: none"> <div class="dialog-title"> <div class="title"> Update </div> <div class="close-button"></div> </div> <div class="dialog-content"> <p class="text"> To deliver this update. we need to stop playback. Continue? </p> </div> <div class="dialog-buttons"> <input class="button submit" type="button" value="Stop Playback"> <input class="button cancel" type="button" value="Cancel"> </div> </div> <div id="queue-content-overlay"></div> <div id="facebook-oneclick-onboarding-dialog" style="display: none"> <div class="dialog-content"> <div class="subtitle">We"ve created a 7-day free trial account just for you.</div> <div class="facebook-onboarding-text"> <p> Your new Rhapsody username: <span class="email" style="font-style: italic"> email@domain.com </span> </p> <p> An email was sent to this account with your temporary password and instructions on how to change your password. </p> <p class="field"> </p><p> By using Rhapsody I agree to the <a href="/terms_of_use" target="_blank">Terms of Use.</a> </p> <input checked="checked" id="member-visibility" type="checkbox">My music profile and activity will be visible to other Rhapsody members. <p></p> </div> </div> <div class="onboarding-footer"> <div class="dialog-buttons"> <input class="button submit" id="oneclick-submit" type="button" value=""> </div> <div class="onboarding-foot-text"> Already a Rhapsody member? <a class="onboarding-sign-in" href="/authentication/login">Sign In</a> </div> </div> <div class="features-footer"> <div class="onboarding-feature"> <div class="feature-pic" id="share-with-friends"></div> <div class="feature-text"> <div class="feature-title">Share with Friends</div> <div class="feature-desc">Build a Music Profile to share favorites with friends</div> </div> </div> <div class="onboarding-feature"> <div class="feature-pic" id="music-to-go"></div> <div class="feature-text"> <div class="feature-title">Music to Go</div> <div class="feature-desc">Take it on the go with mobile apps</div> </div> </div> <div class="onboarding-feature"> <div class="feature-pic" id="personal-playlists"></div> <div class="feature-text"> <div class="feature-title"></div> Personal Playlists <div class="feature-desc">Make playlists for every occasion</div> </div> </div> </div> </div> <div id="facebook-oneclick-onboarding-existed-dialog" style="display: none"> <div class="dialog-title"> <div class="close-button"></div> </div> <div class="dialog-content"> <div class="facebook-onboarding-text"> <p>It looks like you already have an account with us.</p> <p>Sign in to get the most out of your Rhapsody experience.</p> </div> </div> <div class="onboarding-footer"> <div class="dialog-buttons"> <input class="button submit" type="button" value=""> </div> <div class="onboarding-foot-text"> <a href="/fyp">Forgot your password?</a> </div> </div> </div> <div id="desktop-dialog" style="display: none"> <div class="dialog-title"> <div class="close-button"></div> <div class="dialog-title-text">Getting Started with Napster 5.0</div> </div> <div class="dialog-content"> <div class="subtitle">Take your music with you - even without an Internet connection​.</div> <div class="main-desktop-dialog-content"> <div class="desktop-onboarding-image-en"></div> <div class="desktop-onboarding-text"> <p>Download playlists, albums or individual tracks to your computer for offline listening.  Downloaded tracks are saved to your library automatically.</p> <p class="device-sync-text" style="display: none">With a compatible MP3 player, you can also take your playlists with you anywhere you go.  Choose Device Sync from the Account menu to get started!</p> </div> </div> <div class="onboarding-footer"> <div class="dialog-buttons"> OK </div> </div> </div> </div> <div class="dialog-box" id="user-not-valid-dialog" style="display: none"> <div class="dialog-content"> <p> We"re sorry, your username or password appears to have changed. Please sign in or click cancel to continue browsing anonymously. </p> </div> <div class="dialog-buttons"> <input class="button signin" type="button" value="Sign In"> <input class="button cancel" type="button" value="Cancel"> </div> </div> <div class="dialog-box" id="token-not-valid-dialog" style="display: none"> <div class="dialog-content"> <p> We"re sorry, your session has expired. Please sign in or click cancel to continue browsing anonymously. </p> </div> <div class="dialog-buttons"> <input class="button signin" type="button" value="Sign In"> <input class="button cancel" type="button" value="Cancel"> </div> </div> <div class="dialog-box" id="queue-limit-dialog" style="display: none"> <div class="dialog-content"> <p> We"re sorry, you have exceeded the maximum length of the Mixer </p> </div> <div class="dialog-buttons"> <input class="button replace" type="button" value="Replace Mixer"> <input class="button cancel" type="button" value="Cancel"> </div> </div> <div class="trial-dialog" id="trial-signup-dialog" style="display: none"> <div class="close-button"></div> <div class="title"> <div class="heading"></div> </div> <div class="content"> <div id="seven-day-trial"> <h2>7-day trial</h2> <div class="features"> <ul> <li>No credit card required.</li> <li>Listen to anything in the entire catalog!</li> </ul> <a class="button" href="/7daytrial"></a> </div> </div> <div id="fourteen-day-trial"> <h2>14-day trial</h2> <div class="features"> <a class="button" href="/14daytrial"></a> <ul> <li>Credit card required-cancel anytime.</li> <li>Listen to anything in the entire catalog!</li> <li>Plus, go mobile and take your music everywhere!</li> </ul> <div id="mobile"></div> </div> </div> </div> <div class="footer"> <a href="/privacy_policy" target="_blank">Privacy Policy</a> <a href="/terms_of_use" target="_blank">Terms of Use</a> <a href="/offer_terms" target="_blank">Offer Terms</a> </div> </div> <div id="user-account-suspended" style="display: none"> <div class="dialog-title"> Account Suspended <div class="close-button"></div> </div> <div class="content"> Your account has been suspended for lack of payment. Please go to <a href="/account">My Account</a> and check your credit card information. </div> </div> <div id="rhapsody-survey-dialog"> <iframe height="440" src="" width="880"></iframe> <div class="close-button"></div> </div> <div class="dialog-box" id="member-profile-dialog" style="display: none"> <div class="dialog-title"> <div class="title"> Edit Your Profile </div> <div class="close-button"></div> </div> <div class="dialog-content"> <div id="facebook-connect-container"> <div id="facebook-connect-logo"></div> <div id="facebook-connected-logo"></div> <div id="facebook-text"> <div class="connect-title">Connect to Facebook</div> <p class="text">Connect to Facebook to share what you"re listening to with your Facebook friends, and to use your Facebook name and photo for your Rhapsody profile.</p> </div> <div class="unconnected"> <div class="connect-button" id="connect-with-facebook"></div> </div> <div class="connected"> <img class="profile-pic" height="50" src="" width="50"> <div class="profile-info-container"> <div class="profile-name">no name</div> <input id="publish-settings" type="checkbox"> <label class="publish-settings-label" for="publish-settings">Publish my listening activity to Facebook</label> </div> <div class="log-out-container"> <div class="log-out"></div> </div> </div> </div> <div id="rhapsody-connect-container"> <div id="rhapsody-connect-logo"></div> <div id="rhapsody-connected-logo"></div> <div id="napster-connect-logo"></div> <div id="napster-connected-logo"></div> <div id="connect-text"> <div class="connect-title">Connect on Rhapsody</div> <p class="text">Discover new music by following Rhapsody members and letting them find and follow you.</p> </div> <div id="rhapsody-connect-options"> <input id="connect-rhapsody-yes" name="connect-rhapsody" type="radio"> <label class="yes">Yes, share my profile!</label> <input id="connect-rhapsody-no" name="connect-rhapsody" type="radio"> <label class="no">No, thanks</label> <div class="yes-explanation">Let others view my library, playlists and recent listening history.</div> </div> </div> <div class="header"></div> <div class="item" id="member-real-name"> <div class="error"></div> <div class="label">Your Name:</div> <div class="field"> <input id="member_realname" maxlength="128" name="member_realname" type="text"> </div> <div class="field-exp">Lets people find you more easily.</div> </div> <div class="item" id="member-bio"> <div class="error"></div> <div class="label">Music Status:</div> <div class="field"> <textarea></textarea> </div> <div class="field-exp">Your general musical musings, in 150 characters or less.</div> </div> <div class="item" id="member-screenname"> <div class="error"></div> <div class="label">Web Address:</div> <div class="field"> <input id="member_screenname" maxlength="32" name="member_screenname" type="text"> <div class="address-begin">rhapsody.com/members/</div> <div class="address-end"></div> </div> <div class="field-exp">Your personal home on rhapsody.com.</div> </div> <div id="member-terms-agree"> <div class="error"></div> <div class="field"> <input checked="checked" id="member-terms-box" type="checkbox"> <label for="member-terms-box">I agree to the Terms of Use</label> <a href="/terms_of_use?lsrc=rhapnew" target="_blank">View Terms of Use</a> </div> </div> <div class="dialog-buttons"> <input class="button submit" type="button" value="Save"> <input class="button cancel" type="button" value="Cancel"> </div> </div> </div> <div class="dialog-box" id="facebook-missing-permissions-dialog" style="display: none"> <div class="dialog-title"> <div class="title"> Missing Facebook Permissions </div> <div class="close-button"></div> </div> <div class="dialog-content"> <p class="text"> It looks like you"ve connected your Rhapsody account with Facebook, but you"re missing certain required permissions. Click OK to reset these permissions. </p> </div> <div class="dialog-buttons"> <input class="button submit" type="button" value="OK"> </div> </div> <div class="dialog-box" id="client-registered-machines-dialog" style="display: none"> <div class="dialog-title"> <div class="title"> Computer Limit Reached </div> <div class="close-button"></div> </div> <div class="dialog-content"> <p class="text"> You can install and use Rhapsody on up to three computers. Please deauthorize one from the list below, click OK, and try again. </p> <div id="registered-machines"></div> </div> <div class="dialog-buttons"> <input class="button submit" type="button" value="OK"> </div> </div> <div class="dialog-box" id="client-error-dialog" style="display: none"> <div class="dialog-title"> <div class="title"> <!-- No heading needed --> </div> <div class="close-button"></div> </div> <div class="dialog-content"> <div class="error"> There was an error. </div> </div> <div class="dialog-footer"> <div class="dialog-buttons"> <input class="button submit" type="button" value="OK"> </div> </div> </div> <div id="cloud-sync-onboarding-dialog" style="display: none"> <div class="dialog-title"> <div class="title"> Thanks for using Cloud Sync! </div> <div class="close-button"></div> </div> <div class="dialog-content"> <div class="text"> Your Rhapsody library is ready for use.  From here, you can enjoy the music you"ve already collected, or explore even more music from your favorite artists and others like them. </div> <div class="text"> To remove some or all of the music added by this Cloud Sync session, just choose Today (under Recently Added) and click delete. </div> <div class="dialog-buttons"> <input class="button submit" type="button" value="OK"> </div> </div> </div> <div id="favorites-introduction" style="display: none"> <div class="dialog-title"> <div class="title"> Collect your favorite songs </div> <div class="close-button"></div> </div> <div class="dialog-content"> <div class="text"> Click <img src="/images/marketing/fav_heart.png" alt="the heart icon"> to save songs to your Favorites. You can find Favorites on your Profile page. </div> <div class="text"> Is this feature helpful? Tell us what you think by answering a few questions. <a href="https://questionpro.com/t/ADcR7ZOH9o" target="_blank">Give Feedback</a> </div> <div class="dialog-buttons"> <input class="button submit" type="button" value="OK"> </div> </div> </div>  <script type="text/javascript">   //<![CDATA[     Locale.messages = {       noRecommendations: "Sorry, we don"t have any recommendations for you right now",       listen: "Listen to ",       andMillions: "and millions of songs with Rhapsody",       addTo: "Add to",       removeDownloads: "Remove Downloads",       downloadAlbum: "Download Album",       downloadPlaylist: "Download Playlist",       removeDownload: "Remove Download",       downloadTrack: "Download Track",       downloadTracks: "Download Tracks",       screenNameTaken: "Sorry, that screenname is already taken",       noSpecialChar: "No special characters or spaces allowed.",       numbersOnly: "Must only contain numbers.",       fieldLength: "%{field_length} character limit.",       termsOfUse: "You must agree to the Terms of Use before saving",       nameRequired: "You must enter a real name in order to share your member page",       open: "Open",       close: "Close",       follow: "Follow",       unfollow: "Unfollow",       stopFollowing: "Stop following ",       loading: "Loading&hellip;",       addingToMixer: "Adding to Mixer&hellip;",       noTrackData: "No track data",       errorAddingToPlaylist: "Error adding to playlist. Please try again.",       addedTracksToNewPlaylist: "Added tracks to new playlist",       errorCreatingPlayist: "Error creating new playlist. Please try again.",       addedTracksToLibrary: "Added tracks to library",       sendingEmail: "Sending Email&hellip;",       create: "Create",       add: "Add",       newPlaylistName: "New Playlist Name",       maximumPlaylistSize: "Maximum playlist size is %{data} tracks, tracks were not added.",       countAddedToPlaylist: "Added %{count} to playlist",       addTracksToPlaylist: "Add these tracks to playlist.",       byArtist: "By %{artist_name}",       addItemToPlaylist: "Add %{item} to a playlist.",       deleteThis: "Delete %{item}?",       removeAllTracksForFromLibrary: "Remove all tracks for %{item} from your library?",       removeAllTracksFromLibrary: "Remove all tracks from your library?",       deauthorize: "Deauthorize",       noMachinesAuthorized: "No computers authorized",       authorizeMachineTooManyRegistrations: "We"re sorry, but you"ve attempted to authorize too many computers. Please contact Customer Service using the Help link below for assistance.",       authorizeMachineError: "An unexpected error occurred while attempting to authorize this computer. Please try again momentarily. If the problem persists, contact Customer Service using the Help link below.",       offlineTimerError: "You"ve been offline too long! Please connect to the Internet so we can verify your account and get you playing again.",       by: "by",       thisArtist: "this artist ",       copyPlaylist: "%{playlist_name} was added to your playlists",       nowPlaying: "#NowPlaying {{=name}} on @Rhapsody",       nowPlayingAlbum: "#NowPlaying {{=name}} by {{=artistName}} on @Rhapsody",       noMoreRecommendationsFound: "No more recommendations found."     };         var ClientLocale = {       noDownloadedTracks: "You do not have any downloaded tracks.",       noDownloadedPlaylists: "You do not have any downloaded playlists.",       goDownloadTracks: "Download tracks while online to listen in offline mode.",       goDownloadPlaylists: "Download playlists while online to listen to in offline mode.",       view: "View:",       allMusic: "All Music",       downloaded: "Downloaded",       downloadPending: "Download Pending",       removeDownloads: "Remove Downloads",       removeDownload: "Remove Download",       currentlyDownloading: "Currently downloading",       track: "track",       tracks: "tracks",       downloadsCompleted: "Downloads Completed"     };   //]]> </script>  <script type="text/javascript">   //<![CDATA[     Locale.layoutMessage = {       siteChanged: "We"ve made a few changes to our site to improve your experience. Please click",       clickHere: "here",       reloadPage: "to reload the page.",       errorLoad: "We"re sorry, there was an error loading the page."     };   //]]> </script> <script type="text/javascript">   //<![CDATA[     Locale.config = {       couponUrl: "https://order.rhapsody.com/rhapsody/coupons"     };   //]]> </script>  </div>';
	//$('body').append(containerhtml);

	$('body').append('<div id="miniPlayer"><embed src="http://localhost:8080/assets/flash/MiniPlayer.swf?v=21434672f3c0874a856a2a6018c7212665683147" width="1" height="1" align="middle" id="MiniPlayerApp" quality="high" bgcolor="$ffffff" name="MiniPlayerApp" allowscriptaccess="always" pluginspage="http://www.adobe.com/go/getflashplayer" flashvars="namespace=MiniPlayer&amp;cobrand=40134&amp;environment=production" type="application/x-shockwave-flash"> </div>');
	
	var myroot = grabArticle();
	var mybodynodes = getChildTextNodes(myroot,false,false);
	var goldenticket = 0;
	
	var myartistNodes = new Array();
	var myartistTracks = new Array();
	var myartistsplitX = new Array();
	var myartistsplitLen = new Array();
	var myartisti = new Array();
	var myartistx = new Array();
	var myartistIndex = 0;
	var myajaxIndex = 0;
	
	for(var i = 0; i < mybodynodes.length; i++){
		var myNode = mybodynodes[i];
		if(myNode !== undefined){
			var myValue = myNode.nodeValue;
			console.log('ITERATING THROUGH i: ' + i);
			console.log('ITERATING THROUGH THIS NODE ' + myValue);
			if(new String(myValue).trim().length > 0){
				//console.log('THIS NODE IS NOT A WHITESPACE NODE ');
				var wordsArray = new String(myValue).split(" ");
				var splitX = 0;
				for(var x = 0; x < wordsArray.length; x++){
					var thisword = wordsArray[x];
					//console.log('LOOKING AT THIS WORD ' + thisword);
					if(thisword.trim().length > 0 && thisword.substring(0,1) === thisword.substring(0,1).toUpperCase()){
						//console.log('FOUND A CAPITALIZED WORD ' + thisword);
						var j = getWholeProperNoun(wordsArray, x);
						//console.log('X IS ' + x);
						//console.log('J IS ' + j);
						var previousWordsArray = wordsArray.slice(0,x);
						//var clonedArray = wordsArray.splice(0);
						var thisNameArray = wordsArray.slice(x,j+1);
						var thisName = thisNameArray.join(" ");
						//console.log('THIS IS THISNAME ' + thisName);
						var thisPreviousWord = previousWordsArray.join(" ");
						//console.log('THIS IS PREVIOUSWORDSARRAY ' + thisPreviousWord);
						var splitX = thisPreviousWord.length+1;
						if(x == 0){
							splitX = 0;
						}
						var splitLen = thisName.length;
						if(thisNameArray.length > 1){
							thisName = thisName.trim();
							console.log('ENDING LETTERS ARE ' + thisName.substring(thisName.length-2,thisName.length));
							if(isPossessiveNoun(thisName)){
								thisName = thisName.substring(0, thisName.length-2);
								splitLen = splitLen - 2;
							}
							else if(endswithNonAlphaNumericCharacter(thisName)){
								thisName = thisName.substring(0, thisName.length-1);
								splitLen = splitLen - 1;
							}
							console.log('FOUND THIS POTENTIAL ARTIST NAME ' + thisName);
							var myparams = "x="+x+"&i="+i+"&splitX="+splitX+"&splitLen="+splitLen+"&artistname="+encodeJSURL(thisName);
							console.log('SENDING THESE PARAMS ' + myparams);
							myartistIndex++;
							var myartistid = -1;
							$.ajax({
							  type: "POST",
							  async: true,
							  url: APPHOST+"getArtistTracks.php",  
							  data: myparams,
							  success: function(msg) {
								var msgparts = msg.split("%%");
								var myx = parseInt(msgparts[0]);
								var myi = parseInt(msgparts[1]);
								var mysplitX = parseInt(msgparts[2]);
								var mysplitLen = parseInt(msgparts[3]);
								console.log('RESPONSE MSG IS ' + msg + "\n");
								console.log(" i: " + i + " , mybodynodes.length " + (mybodynodes.length-1));
								console.log(" x: " + x + " , wordsArray.length " + (wordsArray.length-1));
								//console.log('myNode IS ' + myNode.textContent);
								console.log('SPLITX IS ' + mysplitX);
								console.log('SPLITLEN IS ' + mysplitLen);
								if(j < wordsArray.length){
									x = j;
								}
								else{
									x = wordsArray.length;
								}
								//x = -1;
								/*
								var newNode = myNode.splitText(splitX);
								myNode = newNode.splitText(splitLen);
								myValue = myNode.nodeValue;
								wordsArray = new String(myValue).split(" ");
								//console.log('NEW NODE IS ' + newNode.textContent);
								//console.log('mybodynodes[i] IS ' + mybodynodes[i].textContent);
								//i--;
								var playerNode = createPlayerNode(myartistid, msg, newNode);
								*/
								myajaxIndex++;
								if(msgparts.length > 5){
									console.log('PUSHING MSGPARTS TO ARRAY ' + msg + '\n');
									myartistTracks.push(msgparts[4]+"%%"+msgparts[5]);
									myartistx.push(myx);
									myartisti.push(myi);
									//myartistNodes.push(myNode);
									myartistsplitX.push(mysplitX);
									myartistsplitLen.push(mysplitLen);
								}
								console.log('myajaxIndex: ' + myajaxIndex + ' , myartistIndex: ' + myartistIndex);
								if(myajaxIndex == myartistIndex){
									createPlayerNodes();
								}
							  }
							});
							goldenticket++;
						}
					}
					splitX = splitX + thisword.length + 1;
				}
			}
		}
	}

	function createPlayerNodes(){
	
		for(var i = myartistTracks.length-1; i > -1; i--){
			var thisArtistNode = mybodynodes[myartisti[i]]; //myartistNodes[i];
			var thisArtistTracks = myartistTracks[i];
			var splitX = myartistsplitX[i];
			var splitLen = myartistsplitLen[i];
			var splitY = (splitX + splitLen);
			console.log('thisArtistTracks: ' + thisArtistTracks + ', thisArtistNode: ' + thisArtistNode.nodeValue + ', splitX: ' + splitX + ' ,splitLen: ' + splitLen + '\n');
			console.log('SPLITX + SPLITLEN ' + splitY + ' ** thisartistnode.length: ' + thisArtistNode.length + '\n');
			if((splitX +splitLen) < thisArtistNode.length+1){
				var newNode = thisArtistNode.splitText(splitX);
				myNode = newNode.splitText(splitLen);
				myValue = myNode.nodeValue;
				wordsArray = new String(myValue).split(" ");
				//x = -1;
				//console.log('NEW NODE IS ' + newNode.textContent);
				//console.log('mybodynodes[i] IS ' + mybodynodes[i].textContent);
				//i--;
				var playerNode = createPlayerNode(thisArtistTracks, newNode);
			}
		}
	}

	function createPlayerNode(tracknames, myChildNode){
		//console.log('TRACKNAMES ARE ' + tracknames);
		var myartisttrack = tracknames.split("%%");
		var mytracks = myartisttrack[1].split("#");
		//console.debug('tracks array ' + mytracks + ' and tracks length ' + mytracks.length);
		if(myartisttrack[1].trim().length> 0 && mytracks.length > 0){
			var playerNode = document.createElement('rhapsodyuniversalplayer');
			$(playerNode).append("<opentracksbutton class='rhapsodybutton'></opentracksbutton>");
			$(playerNode).append("<rhapsodyartist id ='"+myartisttrack[0]+"' ></rhapsodyartist>"); 
			$(playerNode).append("<rhapsodytracks></rhapsodytracks>"); 
			for(var i = 0; i < mytracks.length-1; i++){
				var mytrackidname = mytracks[i].split("@@");
				$(playerNode).children('rhapsodytracks').append('<rhapsodytrack id="'+mytrackidname[0]+'"><rhapsodyplaybutton></rhapsodyplaybutton>'+mytrackidname[1]+'</rhapsodytrack>');
			}
			myChildNode.parentNode.insertBefore(playerNode, myChildNode);
			$(playerNode).children('rhapsodyartist')[0].appendChild(myChildNode);
			return playerNode;
		}
		else{
			return null;
		}		
	}
	
	function getWholeProperNoun(thiswordsArray, thiswordindex){
		var j = thiswordindex;
		//console.log('THISWORDSARRAY IS ' + thiswordsArray.join(' '));
		//console.log('THISWORDINDEX IS '  + thiswordindex);
		var thisword = thiswordsArray[j];
		//console.log('THIS J WORD IS '  + thisword);

		/***
		iterate through capitalized words until you encounter
		1) a punctuation mark
		2) non-capitalized letters
		3) a possessive noun
		4) the end of the array
		**/
		
		while (j < thiswordsArray.length && isCapitalized(thisword) && !endswithNonAlphaNumericCharacter(thisword) && !isPossessiveNoun(thisword)){
			j++;
			if(j < thiswordsArray.length){
				thisword = thiswordsArray[j];
				//console.log('J INDEX'  + j);
				//console.log('INCREMENT J AND NEW J WORD IS '  + thisword);
			}
		}
		
		/***
		if j exceeded length of array, decrement it
		if j did not exceed length of array, but last word was not capitalized, then decrement it
		if last word ended with punctuation, leave it alone
		if last word is possessive, leave it alone
		**/
		if(j == thiswordsArray.length || !isCapitalized(thisword)) { // && !endswithNonAlphaNumericCharacter(thisword) && !isPossessiveNoun(thisword)){
			j = j-1;
		}
		//console.log('RETURNED J INDEX IS '  + j);

		var lastword = thiswordsArray[j];
		//console.log('RETURNED J WORD IS '  + lastword);

/*		
		while(!(containsAlphaNumericCharacter(lastword))) {
			j = j-1;
			lastword = thiswordsArray[j];
		}
*/
		//console.log('RETURNED J INDEX AFTER CHECKING ALPHANUMERIC IS '  + j);
		return j;
	}
	
	function isCapitalized(thisword){
		var begChar = thisword.substring(0,1);
		//console.log('BEGINNING CHAR IS ' + begChar);
		//console.log(begChar.match('/[A-Z]/')
		//console.log('BEGINNING REPLACED IS ' + begChar.replace(/[A-Z]/, ""));
		return begChar.replace(/[A-Z]/, "").length == 0;
	}
	
	function beginsWithDoubleQuotes(thisword){
		return thisword.substring(0,1) == '"';
	}
	
	function endswithNonAlphaNumericCharacter(thisword){
		var endingChar = thisword.substring(thisword.length - 1, thisword.length);
		//console.log('ENDING CHAR IS ' + endingChar);
		//console.log('ENDING REPLACED WITH ' + endingChar.replace(/[A-Za-z0-9]/, ""));
		return endingChar.replace(/[A-Za-z0-9]/, "").length > 0;
	}
	
	function isPossessiveNoun(thisword){
		var ending2Chars = thisword.substring(thisword.length - 3, thisword.length-1);
		return ending2Chars == "'s";
	}
	
	function containsAlphaNumericCharacter(thisword){
		return thisword.replace(/[^A-Za-z0-9]/, "").trim().length > 0;
	}
	
	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	function encodeJSURL(mystring){
		return encodeURIComponent(mystring).replace(/\-/g, "%2D").replace(/\_/g, "%5F").replace(/\./g, "%2E").replace(/\!/g, "%21").replace(/\~/g, "%7E").replace(/\*/g, "%2A").replace(/\'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");
	}  
});

