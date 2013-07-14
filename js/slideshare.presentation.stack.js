slidesharePresentationStack = {
    container: document.getElementById('slideshare_slides'),

    init: function(){
        if(this.container)
            this.get('http://www.slideshare.net/rss/user/' + this.container.getAttribute('data-username'));
    },

    extract: function(text, regex) {
        return text.match(regex)[1];
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

    get: function(surl) {
        var root = 'http://query.yahooapis.com/v1/public/yql?q=';
        var yql = 'select * from xml where url="' + surl + '" and (itemPath="//item/*[local-name()=\'embed\']" OR itemPath="//item//*[local-name()=\'thumbnail\'][contains(@height, \'90\')]")';
        var url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=slidesharePresentationStack.displayPresentationStack';
        document.getElementsByTagName('head')[0].appendChild(this.cssTag());
        document.getElementsByTagName('body')[0].appendChild(this.jsTag(url));
    },

    renderPresentation: function(src_link) {
        document.getElementById("slideshare_presentation").getElementsByTagName("iframe")[0].src= src_link;
    },

    calculateHeight: function(iframe_text, container_width) {
        var existing_iframe_width = this.extract(iframe_text, /\swidth="([0-9]+)"/);
        var existing_iframe_height = this.extract(iframe_text, /\sheight="([0-9]+)"/);
        var iframe_ratio = existing_iframe_height / existing_iframe_width;
        return (container_width * iframe_ratio);
    },

    createSlideNavigationItem: function(iframe_text, thumbnail_url) {
        var src = this.extract(iframe_text, /\ssrc="(.*?)"/);
        var title = "<div class='title'>" + this.extract(iframe_text, /\stitle="(.*?)"/) + "</div>";
        var thumbnail = "<div class='thumbnail'><img src='"+thumbnail_url+"'/></div>";
        return '<li><a href="#" onclick="slidesharePresentationStack.renderPresentation(\''+src+'\')">'+ thumbnail + title +'<div style="clear: both"></div></a></li>';
    },

    displayPresentationStack: function(response) {
        var slide_container = document.createElement('div');
        var slide_width = this.container.getAttribute('data-slide-width');
        slide_container.style.width = slide_width + "px";
        slide_container.style.float = 'left';

        var slide_navigation = document.createElement('div');
        var slide_navigation_bar_width = this.container.getAttribute('data-navigation-width');
        slide_navigation.style.width = slide_navigation_bar_width + "px";
        slide_navigation.style.float = 'left';
        slide_navigation.style.height = '100%';

        if(response.error) {
            slide_container.innerHTML = "Internal Server Error! Please try after sometime."
        } else if(!response.query.results) {
            slide_container.innerHTML = "No slides found for this user."
        } else {
            var iframes = response.query.results.embed;
            var thumbnails = response.query.results.thumbnail;

            if(iframes.length>0) {
                var iframe_div = document.createElement('div');
                iframe_div.id = "slideshare_presentation";
                var first_iframe_text = iframes[0];
                var container_height = this.calculateHeight(first_iframe_text, slide_width);
                this.container.style.height = container_height + "px";
                iframe_div.innerHTML = first_iframe_text.replace(/<div.*?div>/, '').replace(/\swidth="[0-9]+"/, ' width="' + slide_width + '"').replace(/\sheight="[0-9]+"/, ' height="' + container_height + '"');
                slide_container.appendChild(iframe_div);
            }

            var slide_navigation_text = "";
            for (var index in iframes) {
                slide_navigation_text += this.createSlideNavigationItem(iframes[index], thumbnails[index].url);
            }
            slide_navigation.innerHTML = "<ul class='slidesharepresentations'>" + slide_navigation_text + "</ul>";
        }
        this.container.style.width = parseInt(slide_width) + parseInt(slide_navigation_bar_width) + 'px';
        this.container.appendChild(slide_navigation);
        this.container.appendChild(slide_container);
    }
}