slidesharePresentationStack = {
    container: document.getElementById('slideshare_slides'),

    init: function () {
        if (this.container)
            this.getRssFeedViaYQL('http://www.slideshare.net/rss/user/' + this.container.getAttribute('data-username'));
    },

    extract: function (text, regex) {
        return text.match(regex)[1];
    },

    fetchContainerAttributeValueOrDefaultTo: function (attributeName, defaultValue) {
        var value = this.container.getAttribute(attributeName);
        if (!value) value = defaultValue;
        return value;
    },

    jsTag: function (url) {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', url);
        return script;
    },

    cssTag: function () {
        var border = this.fetchContainerAttributeValueOrDefaultTo('data-border', '3px');
        var borderColor = this.fetchContainerAttributeValueOrDefaultTo('data-border-color', '#c4c4c4');
        var slideDividerThickness = this.fetchContainerAttributeValueOrDefaultTo('data-navigation-slide-divider-thickness', '2px');
        var slideDividerColor = this.fetchContainerAttributeValueOrDefaultTo('data-navigation-slide-divider-color', '#FF2635');
        var navigationThumbnailWidth = this.fetchContainerAttributeValueOrDefaultTo('data-navigation-thumbnail-width-percentage', '35%');
        var navigationPresentationTitleLeftMargin = (parseInt(navigationThumbnailWidth.replace('%', '')) + 3) + "%";
        var verticalScrollBarWidth = this.fetchContainerAttributeValueOrDefaultTo('data-vertical-scroll-bar-width', '6px');
        var verticalScrollBarColor = this.fetchContainerAttributeValueOrDefaultTo('data-vertical-scroll-bar-color', '#FF2635');
        var remainingVerticalScrollBarWidth = (parseInt(verticalScrollBarWidth.replace('px', '')) - 2) + "px";
        var fontFamily = this.fetchContainerAttributeValueOrDefaultTo('data-font-family', 'Helvetica, Arial, Tahoma, sans-serif');
        var fontSize = this.fetchContainerAttributeValueOrDefaultTo('data-font-size', '13px');
        var fontWeight = this.fetchContainerAttributeValueOrDefaultTo('data-font-weight', '700');
        var fontColor = this.fetchContainerAttributeValueOrDefaultTo('data-font-color', '#333');
        var fontBackground = this.fetchContainerAttributeValueOrDefaultTo('data-slide-title-background', '#fff');
        var fontBackgroundOnHover = this.fetchContainerAttributeValueOrDefaultTo('data-slide-title-background-on-hover', '#F0F0F0');
        var selectedSlideBackGround = this.fetchContainerAttributeValueOrDefaultTo('data-selected-slide-background-color-in-navigation', '#fff');
        var selectedSlideTitleColor = this.fetchContainerAttributeValueOrDefaultTo('data-selected-slide-text-color-in-navigation', '#333');
        var selectedFontWeight = this.fetchContainerAttributeValueOrDefaultTo('data-selected-slide-text-font-weight-in-navigation', '700');
        var css = "#slideshare_slides{border:" + border + " solid " + borderColor + "; position:relative; padding-bottom: 5px;} \
                   #slideshare_slides *{margin:0; padding:0; list-style:none; float:none;} \
                   #slideshare_slides .slidesharepresentations{ overflow-x:hidden; overflow-y:auto; height: 100%;} \
                   #slideshare_slides .slidesharepresentations li{padding:4px; display: inline-table; border-bottom: " + slideDividerThickness + " solid " + slideDividerColor + "; margin-bottom: 2px; width: 96%;} \
                   #slideshare_slides .slidesharepresentations li .thumbnail{float: left; width: " + navigationThumbnailWidth + ";} \
                   #slideshare_slides .slidesharepresentations li .title{margin-left: " + navigationPresentationTitleLeftMargin + "; padding-top:6px} \
                   #slideshare_slides .slidesharepresentations li img{float: left; margin-right: 5px; width: 100%;} \
                   #slideshare_slides .slidesharepresentations li a{display:block; color:"+fontColor+"; background:"+fontBackground+"; text-decoration:none; font-family:"+fontFamily+"; font-size:"+fontSize+"; font-weight: "+fontWeight+";} \
                   #slideshare_slides .slidesharepresentations li a:hover{background:"+fontBackgroundOnHover+";} \
                   #slideshare_slides .slidesharepresentations li a.nav_slide_link_current{background:"+selectedSlideBackGround+"; color:"+selectedSlideTitleColor+"; font-weight:"+selectedFontWeight+";} \
                   #slideshare_presentation{background:" + borderColor + ";} \
                   ul.slidesharepresentations::-webkit-scrollbar {width: " + verticalScrollBarWidth + ";} \
                   ul.slidesharepresentations::-webkit-scrollbar-track {-webkit-box-shadow: inset 0 0 " + remainingVerticalScrollBarWidth + " rgba(0,0,0,0.3); -webkit-border-radius: " + remainingVerticalScrollBarWidth + "; border-radius: " + remainingVerticalScrollBarWidth + ";} \
                   ul.slidesharepresentations::-webkit-scrollbar-thumb {-webkit-border-radius: " + remainingVerticalScrollBarWidth + "; border-radius: " + remainingVerticalScrollBarWidth + "; background: " + verticalScrollBarColor + "; -webkit-box-shadow: inset 0 0 " + remainingVerticalScrollBarWidth + " rgba(0,0,0,0.5); } \
                   ul.slidesharepresentations::-webkit-scrollbar-thumb:window-inactive { background: rgba(255,0,0,0.4); } \
                   body {scrollbar-face-color: " + verticalScrollBarColor + ";}";
        var style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.innerHTML = css;
        return style;
    },

    getRssFeedViaYQL: function (surl) {
        var root = 'http://query.yahooapis.com/v1/public/yql?q=';
        var yql = 'select * from xml where url="' + surl + '" and (itemPath="//item/*[local-name()=\'embed\']" OR itemPath="//item//*[local-name()=\'thumbnail\'][contains(@height, \'90\')]")';
        var url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=slidesharePresentationStack.displayPresentationStack';
        document.getElementsByTagName('head')[0].appendChild(this.cssTag());
        document.getElementsByTagName('body')[0].appendChild(this.jsTag(url));
    },

    renderPresentation: function (srcLink, currentElement) {
        document.getElementById("slideshare_presentation").getElementsByTagName("iframe")[0].src = srcLink;
        document.getElementsByClassName('nav_slide_link_current')[0].setAttribute("class", "nav_slide_link");
        currentElement.setAttribute("class", "nav_slide_link_current");
    },

    calculateHeight: function (iFrameText, containerWidth) {
        var existingIFrameWidth = this.extract(iFrameText, /\swidth="([0-9]+)"/);
        var existingIFrameHeight = this.extract(iFrameText, /\sheight="([0-9]+)"/);
        var iFrameRatio = existingIFrameHeight / existingIFrameWidth;
        return (containerWidth * iFrameRatio);
    },

    createSlideNavigationItem: function (iFrameText, thumbnailUrl) {
        var src = this.extract(iFrameText, /\ssrc="(.*?)"/);
        var title = "<div class='title'>" + this.extract(iFrameText, /\stitle="(.*?)"/) + "</div>";
        var thumbnail = "<div class='thumbnail'><img src='" + thumbnailUrl + "'/></div>";
        return '<li><a href="#" class="nav_slide_link" onclick="slidesharePresentationStack.renderPresentation(\'' + src + '\', this)">' + thumbnail + title + '<div style="clear: both"></div></a></li>';
    },

    createLeftFloatingDiv: function (width) {
        var slideContainer = document.createElement('div');
        slideContainer.style.width = width + "px";
        slideContainer.style.float = 'left';
        return slideContainer;
    },

    createPresentationNavigationBar: function (iFrames, thumbnails) {
        var numPresentations = iFrames.length;
        var userSpecifiedLimit = this.fetchContainerAttributeValueOrDefaultTo('data-num-presentations', numPresentations);
        if (userSpecifiedLimit < numPresentations) numPresentations = userSpecifiedLimit;
        var slideNavigationText = "";
        for (var index = 0; index < numPresentations; index++) {
            slideNavigationText += this.createSlideNavigationItem(iFrames[index], thumbnails[index].url);
        }
        return "<ul class='slidesharepresentations'>" + slideNavigationText + "</ul>";
    },

    createPresentationFrame: function (iFrameText, slideWidth) {
        var iFrameDiv = document.createElement('div');
        iFrameDiv.id = "slideshare_presentation";
        var containerHeight = this.calculateHeight(iFrameText, slideWidth);
        this.container.style.height = containerHeight + "px";
        iFrameDiv.innerHTML = iFrameText.replace(/\sstyle=".*margin-bottom:5px/, '').replace(/<div.*?div>/, '')
            .replace(/\swidth="[0-9]+"/, ' width="' + slideWidth + '"').replace(/\sheight="[0-9]+"/, ' height="' + containerHeight + '"');
        return iFrameDiv;
    },

    displayPresentationStack: function (response) {
        var slideWidth = this.fetchContainerAttributeValueOrDefaultTo('data-slide-width', 576); //60% of 960
        var slideContainer = this.createLeftFloatingDiv(slideWidth);

        var slideNavigationBarWidth = this.fetchContainerAttributeValueOrDefaultTo('data-navigation-width', 384); //40% of 960
        var slideNavigation = this.createLeftFloatingDiv(slideNavigationBarWidth);
        slideNavigation.style.height = '100%';

        if (response.error) {
            slideContainer.innerHTML = "Internal Server Error! Please try after sometime."
        } else if (!response.query.results) {
            slideContainer.innerHTML = "No slides found for this user."
        } else {
            var iFrames = response.query.results.embed;
            var thumbnails = response.query.results.thumbnail;
            if (iFrames.length > 0) {
                slideContainer.appendChild(this.createPresentationFrame(iFrames[0], slideWidth));
                slideNavigation.innerHTML = this.createPresentationNavigationBar(iFrames, thumbnails);
                slideNavigation.getElementsByClassName('nav_slide_link')[0].setAttribute("class", "nav_slide_link_current");
            }
        }
        this.container.style.width = parseInt(slideWidth) + parseInt(slideNavigationBarWidth) + 'px';
        this.container.appendChild(slideNavigation);
        this.container.appendChild(slideContainer);
    }
};