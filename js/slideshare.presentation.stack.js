slidesharePresentationStack = {
    container: document.getElementById('slideshare.slides'),

    init : function(){
        if(this.container)
            this.get('http://www.slideshare.net/rss/user/' + this.container.getAttribute('data-username'));
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

    calculateHeight: function (iframe_text, container_width) {
        var existing_iframe_width = iframe_text.match(/\swidth="([0-9]+)"/)[1];
        var existing_iframe_height = iframe_text.match(/\sheight="([0-9]+)"/)[1];
        var iframe_ratio = existing_iframe_height / existing_iframe_width;
        return (container_width * iframe_ratio);
    },

    displayPresentationStack: function(o) {
        var slide_container = document.createElement('div');
        var container_width = this.container.getAttribute('data-width');

        if(o.error) {
            slide_container.innerHTML = "Internal Server Error! Please try after sometime."
        } else if(!o.query.results) {
            slide_container.innerHTML = "No slides found for this user."
        } else {
            var iframes = o.query.results.embed;
            var thumbnails = o.query.results.thumbnail;
            for (var index in iframes) {
                var iframe_div = document.createElement('div');
                var thumbnail_div = document.createElement('div');
                var iframe_text = iframes[index];
                var container_height = this.calculateHeight(iframe_text, container_width);
                iframe_div.innerHTML = iframe_text.replace(/\swidth="[0-9]+"/, ' width="' + container_width + '"').replace(/\sheight="[0-9]+"/, ' height="' + container_height + '"');
                var thumbnail = document.createElement('img');
                thumbnail.src = 'https:' + thumbnails[index].url;
                thumbnail.width = '40';
                thumbnail_div.appendChild(thumbnail);
                slide_container.appendChild(iframe_div);
                slide_container.appendChild(thumbnail_div);
            }
        }
        this.container.style.width = container_width + 'px';
        this.container.appendChild(slide_container);
    }
}