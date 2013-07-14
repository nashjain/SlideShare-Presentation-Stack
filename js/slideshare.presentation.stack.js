slidesharePresentationStack = {
    container: document.getElementById('slideshare_slides'),

    init: function(){
        if(this.container)
            this.getRssFeedViaYQL('http://www.slideshare.net/rss/user/' + this.container.getAttribute('data-username'));
    },

    extract: function(text, regex) {
        return text.match(regex)[1];
    },

    fetchContainerAttributeValueOrDefaultTo: function(attributeName, defaultValue) {
        var value = this.container.getAttribute(attributeName);
        if(!value) value = defaultValue;
        return value;
    },

    jsTag: function(url) {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', url);
        return script;
    },

    cssTag: function() {
        var css = "#slideshare_slides{border:3px solid #ccc; position:relative; padding-bottom: 5px;} \
                   #slideshare_slides *{margin:0; padding:0; list-style:none; float:none;} \
                   #slideshare_slides .slidesharepresentations{ overflow:auto; height: 100%;} \
                   #slideshare_slides .slidesharepresentations li{padding:4px; display: inline-table; border-bottom: 2px solid gray; width: 96%;} \
                   #slideshare_slides .slidesharepresentations .thumbnail{float: left; width: 35%;} \
                   #slideshare_slides .slidesharepresentations .title{margin-left: 38%; font-weight: 700;} \
                   #slideshare_slides .slidesharepresentations img{float: left; margin-right: 5px; width: 100%;} \
                   #slideshare_slides a{display:block; color:#333; background:#fff; text-decoration:none; font-family:arial,sans-serif; font-size:13px;} \
                   #slideshare_slides a:hover{background:#ccc;} \
                   #slideshare_slides a.current{background:#393; color:#fff;} \
                   #slideshare_presentation{background:#ccc;}";
        var style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.innerHTML = css;
        return style;
    },

    getRssFeedViaYQL: function(surl) {
        var root = 'http://query.yahooapis.com/v1/public/yql?q=';
        var yql = 'select * from xml where url="' + surl + '" and (itemPath="//item/*[local-name()=\'embed\']" OR itemPath="//item//*[local-name()=\'thumbnail\'][contains(@height, \'90\')]")';
        var url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=slidesharePresentationStack.displayPresentationStack';
        document.getElementsByTagName('head')[0].appendChild(this.cssTag());
        document.getElementsByTagName('body')[0].appendChild(this.jsTag(url));
    },

    renderPresentation: function(srcLink) {
        document.getElementById("slideshare_presentation").getElementsByTagName("iframe")[0].src= srcLink;
    },

    calculateHeight: function(iFrameText, containerWidth) {
        var existingIFrameWidth = this.extract(iFrameText, /\swidth="([0-9]+)"/);
        var existingIFrameHeight = this.extract(iFrameText, /\sheight="([0-9]+)"/);
        var iFrameRatio = existingIFrameHeight / existingIFrameWidth;
        return (containerWidth * iFrameRatio);
    },

    createSlideNavigationItem: function(iFrameText, thumbnailUrl) {
        var src = this.extract(iFrameText, /\ssrc="(.*?)"/);
        var title = "<div class='title'>" + this.extract(iFrameText, /\stitle="(.*?)"/) + "</div>";
        var thumbnail = "<div class='thumbnail'><img src='http://"+ thumbnailUrl+"'/></div>";
        return '<li><a href="#" onclick="slidesharePresentationStack.renderPresentation(\''+src+'\')">'+ thumbnail + title +'<div style="clear: both"></div></a></li>';
    },

    createLeftFloatingDiv: function(width) {
        var slideContainer = document.createElement('div');
        slideContainer.style.width = width + "px";
        slideContainer.style.float = 'left';
        return slideContainer;
    },

    createPresentationNavigationBar: function(iFrames, thumbnails) {
        var numPresentations = iFrames.length;
        var userSpecifiedLimit = this.fetchContainerAttributeValueOrDefaultTo('data-num-presentations', numPresentations);
        if (userSpecifiedLimit < numPresentations) numPresentations = userSpecifiedLimit;
        var slideNavigationText = "";
        for (var index = 0; index < numPresentations; index++) {
            slideNavigationText += this.createSlideNavigationItem(iFrames[index], thumbnails[index].url);
        }
        return "<ul class='slidesharepresentations'>" + slideNavigationText + "</ul>";
    },

    createPresentationFrame: function(iFrameText, slideWidth) {
        var iFrameDiv = document.createElement('div');
        iFrameDiv.id = "slideshare_presentation";
        var containerHeight = this.calculateHeight(iFrameText, slideWidth);
        this.container.style.height = containerHeight + "px";
        iFrameDiv.innerHTML = iFrameText.replace(/<div.*?div>/, '').replace(/\swidth="[0-9]+"/, ' width="' + slideWidth + '"').replace(/\sheight="[0-9]+"/, ' height="' + containerHeight + '"');
        iFrameDiv.getElementsByTagName('iframe')[0].style.marginBottom = '0px';
        return iFrameDiv;
    },

    displayPresentationStack: function(response) {
        var slideWidth = this.fetchContainerAttributeValueOrDefaultTo('data-slide-width', 576); //60% of 960
        var slideContainer = this.createLeftFloatingDiv(slideWidth);

        var slideNavigationBarWidth = this.fetchContainerAttributeValueOrDefaultTo('data-navigation-width', 384); //40% of 960
        var slideNavigation = this.createLeftFloatingDiv(slideNavigationBarWidth);
        slideNavigation.style.height = '100%';

        if(response.error) {
            slideContainer.innerHTML = "Internal Server Error! Please try after sometime."
        } else if(!response.query.results) {
            slideContainer.innerHTML = "No slides found for this user."
        } else {
            var iFrames = response.query.results.embed;
            var thumbnails = response.query.results.thumbnail;
            if(iFrames.length>0) {
                slideContainer.appendChild(this.createPresentationFrame(iFrames[0], slideWidth));
                slideNavigation.innerHTML = this.createPresentationNavigationBar(iFrames, thumbnails);
            }
        }
        this.container.style.width = parseInt(slideWidth) + parseInt(slideNavigationBarWidth) + 'px';
        this.container.appendChild(slideNavigation);
        this.container.appendChild(slideContainer);
    }
}