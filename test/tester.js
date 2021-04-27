var expect = require("chai").expect;
var chatbot = require("../app/index");

describe("Chatbot Functions", function() {
    describe("Get Commands From Database", function() {
        it("Confirmation Success", function() {
            var commandtest = chatbot.getCommandsFromDB;
            // console.log(commandtest);
            expect(commandtest).to.deep.equal("BOT STATUS: Loaded Commands From Database");

        }) ;
    });

    describe("Toggle Live Status Checks", function() {
        it("Confirmation Success", function() {
            var togglecheck = chatbot.getToggled;
            expect(togglecheck).to.deep.equal("Status Toggled");

        }) ;
    });

    describe("Get Quotes From DB", function() {
        it("Quotes Pulled Successfully.", function() {
            var quotes = chatbot.getQuotesFromDB;
            expect(quotes).to.not.equal(undefined);

        }) ;
    });

    describe("Get Filter From DB", function() {
        it("Filter Pulled Successfully.", function() {
            var filter = chatbot.getFilterFromDB;
            expect(filter).to.not.equal(undefined);

        }) ;
    });

    describe("Add Test Data To Filter ", function() {
        it("Successfully added.", function() {
            var filter = chatbot.addToFilter;
            expect(filter).to.deep.equal("Confirmed");

        }) ;
    });

    describe("Remove Test Data To Filter ", function() {
        it("Successfully removed.", function() {
            var filter = chatbot.deleteFromFilter;
            expect(filter).to.deep.equal("Confirmed");

        }) ;
    });
});