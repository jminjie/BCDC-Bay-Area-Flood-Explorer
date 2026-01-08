define(["jquery"], function(jQuery) {
    
    function Navbar(container, clickFunction) {
        this.$nav          = $(container);
        this.$navContent   = $("<div>", {id: "navbar-content"}).appendTo(this.$nav);
        this.clickFunction = clickFunction;
        this.hide();
    };
    
    Navbar.prototype.hide = function() {
        this.$nav.hide();
    };
    
    Navbar.prototype.buildFromHeaders = function(headers, pageName) {
        if(!headers.length) return this.hide();
        pageName = !pageName ? "" : "/"+pageName;
        
        var structure = [], 
            nest = [null], 
            depth = 0;
        for(var i = 0; i < headers.length; ++i) {
            headers[i].setAttribute("id", "nav-a-"+i);
            var hType = parseInt(headers[i].tagName[1])-1, 
                item = [headers[i].innerHTML, i, []];
            if(headers[i].hasAttribute("nav-title")) {
                item[0] = headers[i].getAttribute("nav-title");
            }
            if(hType > depth) {
                nest.push(null);
                ++depth;
            } else if(hType < depth) {
                nest.pop();
                --depth;
            }
            if(!depth) {
                structure.push(item);
            } else {
                nest[depth-1][2].push(item);
            }
            nest[depth] = item;
        }
        
        var recursiveList = function(currentList, currentItem) {
            var anchorId = "#nav-a-" + currentItem[1], 
                lastLi = $("<li>").appendTo(currentList).html(
                    "<a class='nav-title' href='" + pageName + anchorId + "' goto='" + anchorId + "'>" + currentItem[0] + "</a>"
                );
            if(!currentItem[2].length) {
                lastLi = null;
                return;
            }
            currentList = $("<ul>").appendTo(lastLi);
            lastLi = null;
            for(var k = 0; k < currentItem[2].length; ++k) {
                recursiveList(currentList, currentItem[2][k]);
            }
        };
        
        this.$navContent.html("");
        var theList = null;
        for(var i = 0; i < structure.length; ++i) {
            var anchorId = "#nav-a-" + structure[i][1], 
                linkHtml = "<p><a class='nav-title' href='" + pageName + anchorId + "' goto='" + anchorId + "'>" + structure[i][0] + "</a></p>";
            this.$navContent.append(linkHtml);
            theList = $("<ul>").appendTo(this.$navContent);
            for(var j = 0; j < structure[i][2].length; j++) {
                recursiveList(theList, structure[i][2][j]);
            }
        }
        this._initList();
    };
    
    Navbar.prototype.buildFromList = function(topListElem, pageName) {
        pageName = !pageName ? "" : "/"+pageName;
        
        var recursiveList = function(menuList, parseList, index) {
            if(!index) index = 0;
            for(var i = 0; i < parseList.children.length; ++i) {
                if(parseList.children[i].tagName.toLowerCase() === "li") {
                    var titleElem = parseList.children[i].querySelector(".section-title"), 
                        title     = titleElem ? titleElem.innerText : "", 
                        anchorId  = "nav-a" + index;
                    parseList.children[i].setAttribute("id", anchorId);
                    menuList.append("<li><p><a class='nav-title' href='" + pageName + "#" + anchorId + "' goto='#" + anchorId + "' >" + title + "</a></p></li>");
                    ++index;
//                    for(var j = 0; j < listItem.children.length; ++j) {
//                        var tag = listItem.children[j].tagName.toLowerCase();
//                        if(tag === "ul" || tag === "ol") {
//                            index = recursiveList(
//                                $("<ul>", {'class': "force-style"}).appendTo(menuList), 
//                                listItem.children[j], 
//                                index
//                            );
//                        }
//                    }
                }
            }
            return index;
        };
        
        this.$navContent.html("");
        recursiveList(
            $("<ul>", {'class': 'no-style'}).appendTo(this.$navContent), 
            topListElem[0]
        );
        this._initList();
    };
    
    Navbar.prototype._initList = function() {
        var self = this;
        this.$navContent.find("a").on("click", function(evt) {
            evt.preventDefault();
            self.clickFunction($(this.getAttribute('goto')));
        });
        this.$nav.show();
    };
    
    return Navbar;
    
});