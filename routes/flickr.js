const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const router = express.Router();
const flickr = {
    method: 'flickr.photos.search',
    api_key: "3b0dffa51d315ddb09d223af3fe89119",
    format: "json",
    media: "photos",
    nojsoncallback: 1
};

router.use(logger('tiny'));

router.get('/:query/:number', (req, res) => {
    const options = createFlickrOptions(req.params.query, req.params.number);
    const url = `https://${options.hostname}${options.path}`;

    axios.get(url).then((response) => {
        res.writeHead(response.status,{'content-type': 'text/html'});
        return response.data;
    }).then((rsp) => {
        const s = parseAndCreatePage('Flickr Photo Search', rsp);
        res.write(s);
        res.end();
    }).catch((error) => {
        console.error(error);
    });
});

function createFlickrOptions(query, number) {
    const options = {
        hostname: 'api.flickr.com',
        port: 443,
        path: '/services/rest/?',
        method: 'GET'
    }

    const str = 'method=' + flickr.method +
        '&api_key=' + flickr.api_key +
        '&tags=' + query +
        '&per_page=' + number +
        '&format=' + flickr.format +
        '&media=' + flickr.media +
        '&nojsoncallback=' + flickr.nojsoncallback;
    
    options.path += str;
    return options;
}

function parseAndCreatePage(title, rsp) {
    let s = "<h1>" + title + "<h1/>";
    s += "total number is: " + rsp.photos.photo.length + "<br/>";

    // http://farm{farm-id}.static.flickr.com/{server-id}/{id}_{secret}_[mstb].jpg
    // http://www.flickr.com/photos/{user-id}/{photo-id}
    for (let i = 0; i < rsp.photos.photo.length; i++) {
        photo = rsp.photos.photo[i];
        t_url = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_" + "t.jpg";
        p_url = "http://www.flickr.com/photos/" + photo.owner + "/" + photo.id;
        s +=  '<a href="' + p_url + '">' + '<img alt="'+ "Image not found" + '"src="' + t_url + '"/>' + '</a>';
    }
    return s;
}

module.exports = router;
