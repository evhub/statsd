console.group("Installing...");

chrome.app.runtime.onLaunched.addListener(function() {
                                          
                                          console.group("Loading...");
                                          
                                          chrome.app.window.create("display.html", {
                                                                   id: "mainwin",
                                                                   bounds: {
                                                                        width: 680,
                                                                        height: 480
                                                                        }
                                                                   });
                                          
                                          console.log("Loaded.");
                                          console.groupEnd();
                                          
                                          });

console.log("Installed.");
console.groupEnd();
