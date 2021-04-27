var expect = require("chai").expect;
var request = require("request"); 

describe("Chatbot Web Interface", function(){
    describe("Login Page - Online", function() {
        var url="http://localhost:3000/";

        it("returns status 200", function() {
            request(url, function(error, response, body) {
               expect(response.statusCode).to.equal(200);
            })
        })
    })

    describe("Home Page - Online", function() {
        var url="http://localhost:3000/index";

        it("returns status 200", function() {
            request(url, function(error, response, body) {
               expect(response.statusCode).to.equal(200);
            })
        })
    })

    describe("Filter Page - Online", function() {
        var url="http://localhost:3000/filter";

        it("returns status 200", function() {
            request(url, function(error, response, body) {
               expect(response.statusCode).to.equal(200);
            })
        })
    })

    
    describe("Command Page - Online", function() {
        var url="http://localhost:3000/commands";

        it("returns status 200", function() {
            request(url, function(error, response, body) {
               expect(response.statusCode).to.equal(200);
            })
        })
    })

    describe("Quotes Page - Online", function() {
        var url="http://localhost:3000/quotes";

        it("returns status 200", function() {
            request(url, function(error, response, body) {
               expect(response.statusCode).to.equal(200);
            })
        })
    })
});

describe("Chatbot API", function(){
    describe("Quotes API", function() {
        var url="http://localhost:3000/api/quotes";

        it("returns status 200", function() {
            request(url, function(error, response, body) {
               expect(response.statusCode).to.equal(200);
            })
        })
    })

    describe("Commands API", function() {
        var url="http://localhost:3000/api/commands";

        it("returns status 200", function() {
            request(url, function(error, response, body) {
               expect(response.statusCode).to.equal(200);
            })
        })
    })


});