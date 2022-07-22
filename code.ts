// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
figma.skipInvisibleInstanceChildren = true;

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.


/*let target = []
target.push(figma.getNodeById("2400:3285"));
figma.viewport.scrollAndZoomIntoView(target);
*/

figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from

  if (msg.type =='zoomPage') {
    console.log('in zoom page2');
    let targetPage= figma.getNodeById(msg.page);
    targetPage as PageNode;
    figma.currentPage = targetPage as PageNode;
    console.log(msg.instances);
    let pageInstances = JSON.parse(msg.instances)
    console.log(pageInstances, 'page instnaces')
    let target = []

    for(var i=0; i<pageInstances.length; i++) {
     var pageInstance = pageInstances[i];
      console.log(pageInstance, 'page instance');
      console.log(figma.getNodeById(pageInstance), 'getnodes');
      target.push(figma.getNodeById(pageInstance));
     // figma.viewport.scrollAndZoomIntoView(target);
    }
    console.log(target,'tearget');
    figma.viewport.scrollAndZoomIntoView(target);
    figma.currentPage.selection = target;

    
  }
  if (msg.type == 'zoom') {
    console.log('zoom');
    let targetPage= figma.getNodeById(msg.page);

    let target = []
    target.push(figma.getNodeById(msg.id));
    figma.currentPage = targetPage as PageNode;
    figma.viewport.scrollAndZoomIntoView(target);

    var page = figma.currentPage as PageNode;
    page.selection = target;
  }
  // your HTML page is to use an object with a "type" property like this.

  if (msg.type === 'find') {    
    const scope = msg.scope;
    const selection = figma.currentPage.selection;
    console.log('selection', selection);
    let frameFrame;
    let masterFrame;
    let searchInFrame = false;
   
    //if(scope === 'frame') {
    
    if(selection.length == 2) {
      if((selection[0].type == 'COMPONENT') || (selection[0].type == 'INSTANCE')) {
        if(selection[1].type == 'FRAME') {
            searchInFrame = true;
            frameFrame = 1;
            masterFrame = 0;
          
        }
      }
      if((selection[1].type == 'COMPONENT') || (selection[1].type == 'INSTANCE')) {
        if(selection[0].type == 'FRAME') {
            searchInFrame = true;
            frameFrame = 0;
            masterFrame = 1;
          
        }
      }
      if(searchInFrame == false ){
        //selected two items and scope frame but did not selecte a frame and an insatnce
        figma.ui.postMessage(5); // please select only one frame   
        figma.notify("Please select a single instance/main component and a single frame");
        console.log('message 5')       
            return 'empty';
      }
    }//selection length ==2
    else {
      //you need to select a frame and master
      if(scope == 'frame') {
        figma.notify('Please select a single instance/main component and a single frame')
        figma.ui.postMessage(4); // please select only a single component or instance
        return 'empty';
      }
      
    }//selection != 2
      
    //}//scope == frame
    
    
    
    if(searchInFrame) {
      console.log('searching in frame');
      //SEARCHING IN FRAME
      
       //get all insatnces or frames 
       const doc = figma.root;

      let master;
      if(selection[masterFrame].type == 'INSTANCE') {
        //get master component
        master = (selection[masterFrame] as InstanceNode).mainComponent;
       // console.log('type is isntace');
       // console.log(master, 'master');
      }
      else {
       // console.log('selection', selection[masterFrame]);
        master = selection[masterFrame];
        //console.log('type is not instance');
      }
      let instances = (selection[frameFrame] as FrameNode).findAll(id => id.type === 'INSTANCE');
      console.log (instances,'instaces from search in frame');
      
      //cycle through instances and check if id is the same as the master id we are looking for
      let result = [];
      let matchingInstances = [];
      console.log('master id to search for', master.id);
      for(const instance of instances as any) {
      //  console.log(instance, 'instance');
        var instanceMasterId = instance.masterComponent.id;
        var masterId = master.id;
        if(instanceMasterId== masterId) {
          console.log('found match', instance);
          //build the instance object
          let instanceInfo = {} as any;
          instanceInfo.id = instance.id;
          instanceInfo.name = instance.name;
          matchingInstances.push(instanceInfo);

          //console.log('found a match', instanceInfo);
        }
      }
      //build the page object
      let frameResult = {} as any;
      frameResult.searchId = master.id;
      frameResult.searchName = master.name;
      frameResult.pageId = figma.currentPage;
      frameResult.id = figma.currentPage.id;
      frameResult.name = selection[frameFrame].name;                       
      frameResult.instances = matchingInstances;
      console.log(frameResult,' fraem result');

      //send to ui
      result.push(frameResult);
      figma.ui.postMessage(result);


    } // end search in frame
    
    if((scope != "frame") && (!searchInFrame)) {
      if(selection.length == 1) {
      //check if we have a componnet and a frame)
      
      
     
        if((selection[0].type == 'COMPONENT') || (selection[0].type == 'INSTANCE')) {
          //instance or component
          
          //get all insatnces or frames 
          const doc = figma.root;
  
          //console.log('instance or component');
          let master;
          if(selection[0].type == 'INSTANCE') {
            //get master component
            master = (selection[0] as InstanceNode).mainComponent;
           // console.log('type is isntace');
           // console.log(master, 'master');
          }
          else {
           // console.log('selection', selection[0]);
            master = selection[0];
            //console.log('type is not instance');
          }
           // console.log(master, 'master');
            
  
            //go through all pages and create a list of instacnes in those pages
  
            //console.log(doc, 'doc');
            let result = [];
            const currentPage = figma.currentPage;
            for (const page of doc.children) {
              console.log(page.name,' page');
              //pages.push(page.name); // this is the list of all pages in the doc
  
              //page.name
              //search current page in loop for all instances
              var checkThis = false;
              //console.log(scope,'scope');
              
              if(scope == 'page') {
              //  console.log('searching in page');
                if(page.id == currentPage.id) {
                  checkThis = true;                
                }  
              }
             
              
              else {  
                //console.log('searcing entire doc');
                //search the entire document
                checkThis = true;
              }
              console.log('checkThis', checkThis);
              if(checkThis) {
                var masterId = master.id;
                var pageActual = page ;
                const instances = pageActual.findAllWithCriteria({types: ['INSTANCE']});
                
                console.log(instances.length, "number of instances");
                var d = new Date();
                console.log(d.toString() );// returns "Sun May 10 2015 19:50:08 GMT-0600 (MDT)"
                //cycle through instances and check if id is the same as the master id we are looking for
                let matchingInstances = [];
                var instancesLength = instances.length;
                //var instance = instances[1];
                for(let i=0; i<instancesLength; i++) {
                  var d = new Date();
                  console.log(d.toString() );// returns "Sun May 10 2015 19:50:08 GMT-0600 (MDT)"
                  var instance = instances[i];
                  var instanceMainComponentId = instance.mainComponent.id;
                  //if(1==1) {
                  if(instanceMainComponentId== masterId) {
                    //build the instance object
                   // console.log(instances[i], "matching instnace");
                    let instanceInfo = {} as any;
                    instanceInfo.id = instance.id;
                    instanceInfo.name =instance.name;
                    matchingInstances.push(instanceInfo);
  
                    //console.log('found a match', instanceInfo);
                  }
                }
                 var d = new Date();
                console.log(d.toString() );// returns "Sun May 10 2015 19:50:08 GMT-0600 (MDT)"
                //let obj = instances.filter(instance => instance.mainComponent.id == master.id);
                //console.log(obj,'obj');
                /*for(const instance of instances as any) {
                 // console.log(instance, 'instance');
                 

                    if(instance.mainComponent.id == master.id) {
                      //build the instance object
                      let instanceInfo = {} as any;
                      instanceInfo.id = instance.id;
                      instanceInfo.name = instance.name;
                      matchingInstances.push(instanceInfo);
    
                      //console.log('found a match', instanceInfo);
                    }
                  }
                */
                //build the page object
                let pageResult = {} as any;
                pageResult.id = page.id;
                pageResult.name = page.name;                       
                pageResult.instances = matchingInstances;
    
                //send to ui
                result.push(pageResult);
                
              }//end if
  
              
  
  
  
  
  
            }
            //console.log('the results:', result);
            figma.ui.postMessage(result);
  
        }
        else {
          //not a instance or component
          //console.log('not instance or component');
          figma.notify('Please select a signle instance/master component when searching in page or entire document')
          figma.ui.postMessage(2); // please select only a single component or instance
            return 'empty';
        }
      
      
    }
    else {
      //not a single selection
      //console.log('selected more or less than one');
      figma.notify('Please select a signle instance/master component when searching in page or entire document')
      figma.ui.postMessage(1); // please select only one frame          
          return 'empty';
    } //end else
    }
    
    
      
    

    //figma.viewport.scrollAndZoomIntoView(nodes);
  } //msg.type find
  if(msg.type === 'close') {
    figma.closePlugin();
  }
}
