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

    create_left_floating_div: function(width) {
        var slide_container = document.createElement('div');
        slide_container.style.width = width + "px";
        slide_container.style.float = 'left';
        return slide_container;
    },

    create_presentation_navigation_bar: function(iframes, thumbnails) {
        var num_presentations = iframes.length;
        var user_specified_limit = this.container.getAttribute('data-num-presentations');
        if (user_specified_limit && user_specified_limit < num_presentations)
            num_presentations = user_specified_limit;
        var slide_navigation_text = "";
        for (var index = 0; index < num_presentations; index++) {
            slide_navigation_text += this.createSlideNavigationItem(iframes[index], thumbnails[index].url);
        }
        return "<ul class='slidesharepresentations'>" + slide_navigation_text + "</ul>";
    },

    create_presentation_frame: function(iframe_text, slide_width) {
        var iframe_div = document.createElement('div');
        iframe_div.id = "slideshare_presentation";
        var container_height = this.calculateHeight(iframe_text, slide_width);
        this.container.style.height = container_height + "px";
        iframe_div.innerHTML = iframe_text.replace(/<div.*?div>/, '').replace(/\swidth="[0-9]+"/, ' width="' + slide_width + '"').replace(/\sheight="[0-9]+"/, ' height="' + container_height + '"');
        return iframe_div;
    },

    displayPresentationStack: function(response) {
        var slide_width = this.container.getAttribute('data-slide-width');
        var slide_container = this.create_left_floating_div(slide_width);

        var slide_navigation_bar_width = this.container.getAttribute('data-navigation-width');
        var slide_navigation = this.create_left_floating_div(slide_navigation_bar_width);
        slide_navigation.style.height = '100%';

        if(response.error) {
            slide_container.innerHTML = "Internal Server Error! Please try after sometime."
        } else if(!response.query.results) {
            slide_container.innerHTML = "No slides found for this user."
        } else {
            var iframes = response.query.results.embed;
            var thumbnails = response.query.results.thumbnail;
            if(iframes.length>0) {
                slide_container.appendChild(this.create_presentation_frame(iframes[0], slide_width));
                slide_navigation.innerHTML = this.create_presentation_navigation_bar(iframes, thumbnails);
            }
        }
        this.container.style.width = parseInt(slide_width) + parseInt(slide_navigation_bar_width) + 'px';
        this.container.appendChild(slide_navigation);
        this.container.appendChild(slide_container);
    }
}