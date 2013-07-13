slidesharePresentationStack = {

    init : function(){
        var div = document.getElementById('slideshare.slides');
        this.get('http://www.slideshare.net/rss/user/' + div.getAttribute('username'));
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

    displayPresentationStack: function(o) {
        var container = document.createElement('div');
        if(o.error) {
            container.innerHTML = "Internal Server Error! Please try after sometime."
        } else if(!o.query.results) {
            container.innerHTML = "No slides found for this user."
        } else {
            var iframes = o.query.results.embed;
            var thumbnails = o.query.results.thumbnail;
            for (var index in iframes) {
                var iframe_div = document.createElement('div');
                var thumbnail_div = document.createElement('div');
                iframe_div.innerHTML = iframes[index];
                var thumbnail = document.createElement('img');
                thumbnail.src = 'https:' + thumbnails[index].url;
                thumbnail.width = '40';
                thumbnail_div.appendChild(thumbnail);
                container.appendChild(iframe_div);
                container.appendChild(thumbnail_div);
            }
        }
        document.getElementById('slideshare.slides').appendChild(container);
    }
}