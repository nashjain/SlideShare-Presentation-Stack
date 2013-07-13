slidesharePresentationStack = {
    container: document.getElementById('slideshare.slides'),

    init : function(){
        if(this.container)
            this.get('http://www.slideshare.net/rss/user/' + this.container.getAttribute('data-username'));
    },

    extract : function (text, regex) {
        return text.match(regex)[1];
    },

    get : function(surl) {
        var root = 'http://query.yahooapis.com/v1/public/yql?q=';
        var yql = 'select * from xml where url="' + surl + '" and (itemPath="//item/*[local-name()=\'embed\']" OR itemPath="//item//*[local-name()=\'thumbnail\'][contains(@height, \'90\')]")';
        var url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=slidesharePresentationStack.displayPresentationStack';
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', url);
        document.getElementsByTagName('body')[0].appendChild(script);
    },

    renderPresentation: function(src_link) {
        document.getElementById("slideshare_presentation").getElementsByTagName("iframe")[0].src= src_link;
    },

    calculateHeight: function (iframe_text, container_width) {
        var existing_iframe_width = this.extract(iframe_text, /\swidth="([0-9]+)"/);
        var existing_iframe_height = this.extract(iframe_text, /\sheight="([0-9]+)"/);
        var iframe_ratio = existing_iframe_height / existing_iframe_width;
        return (container_width * iframe_ratio);
    },

    createSlideNavigationItem: function (iframe_text, thumbnail_url) {
        var src = this.extract(iframe_text, /\ssrc="(.*?)"/);
        var title = this.extract(iframe_text, /\stitle="(.*?)"/);
        var thumbnail = " <img src='https:"+thumbnail_url+"' width='40'/>";
        return '<li><a href="#" onclick="slidesharePresentationStack.renderPresentation(\''+src+'\')">'+ title + thumbnail +'</a></li>';
    },

    displayPresentationStack: function(o) {
        var slide_container = document.createElement('div');
        var slide_width = this.container.getAttribute('data-slide-width');
        slide_container.style.width = slide_width + "px";
        slide_container.style.float = 'left';

        var slide_navigation = document.createElement('div');
        var slide_navigation_bar_width = this.container.getAttribute('data-navigation-width');
        slide_navigation.style.width = slide_navigation_bar_width + "px";
        slide_navigation.style.float = 'left';

        if(o.error) {
            slide_container.innerHTML = "Internal Server Error! Please try after sometime."
        } else if(!o.query.results) {
            slide_container.innerHTML = "No slides found for this user."
        } else {
            var iframes = o.query.results.embed;
            var thumbnails = o.query.results.thumbnail;

            if(iframes.length>0) {
                var iframe_div = document.createElement('div');
                iframe_div.id = "slideshare_presentation";
                var first_iframe_text = iframes[0];
                var container_height = this.calculateHeight(first_iframe_text, slide_width);
                iframe_div.innerHTML = first_iframe_text.replace(/\swidth="[0-9]+"/, ' width="' + slide_width + '"').replace(/\sheight="[0-9]+"/, ' height="' + container_height + '"');
                slide_container.appendChild(iframe_div);
            }

            var slide_navigation_text = "";

            for (var index in iframes) {
                slide_navigation_text += this.createSlideNavigationItem(iframes[index], thumbnails[index].url);
            }
            slide_navigation.innerHTML = "<ul>" + slide_navigation_text + "</ul>";
        }
        this.container.style.width = parseInt(slide_width) + parseInt(slide_navigation_bar_width) + 'px';
        this.container.appendChild(slide_navigation);
        this.container.appendChild(slide_container);
    }
}