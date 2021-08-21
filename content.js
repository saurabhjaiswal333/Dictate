var AWS = require('aws-sdk');
var s3 = new AWS.S3();

exports.handler = function(event, context, callback) {
//lambda fn returns body in log and callback
    // Retrieve the bucket & key for the uploaded S3 object that
    // caused this Lambda function to be triggered
//    var src_bkt = event.Records[0].s3.bucket.dictatebucket;
 //   var src_key = event.Records[0].s3.object.s3text.txt;
var src_bkt = "dictatebucket";
    var src_key = "s3text.txt";
    // Retrieve the object
    s3.getObject({
        Bucket: src_bkt,
        Key: src_key
    }, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            callback(err);
        } else {
            console.log("Raw text:\n" + data.Body.toString('ascii'));
            callback(null, data.Body.toString('ascii'));
        }
    });
};