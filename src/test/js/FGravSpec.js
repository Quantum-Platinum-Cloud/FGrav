describe("FGrav", function() {

    var t;

    beforeEach(function () {
        t = new FGrav(1, 2, 3, 4, "TITLE");
    });


    describe("when loadDynamicJs invoked ", function () {

        beforeEach(function () {
            jasmine.Ajax.install();
            jasmine.Ajax.stubRequest("js/frame/FG_Filter_Test.js").andReturn({
                responseText: "function FG_Filter_Test() {}\n" +
                    " FG_Filter_Test.prototype.filter = function(name) {" +
                    "    return name + name;" +
                    "}"
            });
            jasmine.Ajax.stubRequest("js/frame/FG_Filter_Other.js").andReturn({
                responseText: "function FG_Filter_Other() {}\n" +
                    " FG_Filter_Other.prototype.filter = function(name) {" +
                    "    return 'x';" +
                    "}"
            });
            jasmine.Ajax.stubRequest("js/color/FG_Color_Test.js").andReturn({
                responseText: "" +
                    "function FG_Color_Test() {\n" +
                    "    FG_Color.call(this);\n" +
                    "}\n" +
                    "FG_Color_Test.prototype = Object.create(FG_Color.prototype);\n" +
                    "FG_Color_Test.prototype.constructor = FG_Color_Test;\n" +
                    "FG_Color_Test.prototype.colorFor = function(f, s) {" +
                    "    return 'rgb(122,122,122)';" +
                    "}"
            });
            frameFilter.reset();
            colorScheme = undefined;
        });

        afterEach(function () {
            colorScheme = undefined;
            jasmine.Ajax.uninstall();
        });


        it("should load dynamic js file", function (done) {
            t.loadDynamicJs([new DynamicallyLoading("js/frame/FG_Filter_Test.js", "frameFilter.filters.push(new FG_Filter_Test());")], function () {

                try {
                    var request = jasmine.Ajax.requests.mostRecent();
                    expect(request.url).toBe("js/frame/FG_Filter_Test.js");
                    expect(request.method).toBe('GET');

                    expect(frameFilter.filters[0].filter('foo')).toEqual("foofoo");

                    done();
                } catch (e) {
                    done(e);
                }
            }, function () {
                done.fail("ajax should succeed");
            });
        });

        it("should load dynamic js file with additional installation script", function (done) {
            t.loadDynamicJs([new DynamicallyLoading("js/color/FG_Color_Test.js", "colorScheme = new FG_Color_Test();")], function () {

                try {
                    var request = jasmine.Ajax.requests.mostRecent();
                    expect(request.url).toBe("js/color/FG_Color_Test.js");
                    expect(request.method).toBe('GET');

                    expect(colorScheme.colorFor()).toEqual("rgb(122,122,122)");

                    done();
                } catch (e) {
                    done(e);
                }
            }, function () {
                done.fail("ajax should succeed");
            });
        });

        it("should load multiple dynamic js filters", function (done) {
            t.loadDynamicJs([
                new DynamicallyLoading("js/frame/FG_Filter_Other.js", "frameFilter.filters.push(new FG_Filter_Other());"),
                new DynamicallyLoading("js/color/FG_Color_Test.js", "colorScheme = new FG_Color_Test();"),
                new DynamicallyLoading("js/frame/FG_Filter_Test.js", "frameFilter.filters.push(new FG_Filter_Test());")], function () {

            try {
                expect(frameFilter.filters.length).toEqual(2);
                expect(frameFilter.filters[0].filter('foo')).toEqual("x");
                expect(frameFilter.filters[1].filter('foo')).toEqual("foofoo");
                expect(colorScheme.colorFor()).toEqual("rgb(122,122,122)");

                done();
            } catch (e) {
                done(e);
            }
        }, function () {
            done.fail("ajax should succeed");
        });
        });
    });


    describe("when getParameter invoked ", function () {

        it("should return parameter value", function() {

            expect(t.getParameter("param", "DEFAULT", "?param=VALUE")).toEqual("VALUE");
        });

        it("should return parameter value among others", function() {

            expect(t.getParameter("param", "DEFAULT", "?other=v&param=VALUE")).toEqual("VALUE");
        });

        it("should use default if no parameter is passed", function() {

            expect(t.getParameter("param", "DEFAULT", "")).toEqual("DEFAULT");
        });


        it("should use default if specific parameter is not passed", function() {

            expect(t.getParameter("param", "DEFAULT", "?other=value1&another=value2")).toEqual("DEFAULT");
        });
    });

    describe("when constructor invoked ", function () {

        var w;

        beforeEach(function () {
            w  = {  jQuery: true,
                location: { search: '?a=b&width=17'},
                document: {
                    getElementsByTagName:
                        function(name) {
                            return ['svg']
                        },
                    getElementById: function(id) {
                            return undefined;
                        }
                    }
                }
        });

        it("should return when jQuery is loaded and set document references", function () {
            t = new FGrav(1, 2, 3, 4, "TITLE", w);
            expect(t.svg).toEqual('svg');
            expect(t.forcedWidth).toEqual('17');
        });
    });
});