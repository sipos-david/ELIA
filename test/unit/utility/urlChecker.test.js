/* eslint-disable no-undef */
var assert = require("assert");
const validURL = require("../../../source/components/music/UrlChecker.js");

describe("UrlChecker", function () {
    describe("#validURL()", function () {
        it("these URLs are valid", function () {
            assert.strictEqual(
                validURL(
                    "https://www.youtube.com/watch?v=NYeLG0wG--k&list=RDGMEMTmC-2iNKH_l8gQ1LHo9FeQVMNYeLG0wG--k&start_radio=1"
                ),
                true
            );
            assert.strictEqual(validURL("remelemEzNem.jo"), true);
            assert.strictEqual(validURL("https://vagyMegis.jo"), true);
        });

        it("these URLs are NOT valid", function () {
            assert.strictEqual(validURL("htt:n3$e|.jo"), false);
            assert.strictEqual(validURL("sptth:$|__1.44.jo"), false);
        });
    });
});
