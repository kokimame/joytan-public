function loadProjects(wavRefLookup) {
  const storage = firebase.storage();
  const storageRef = storage.ref();
  const structureRef = storageRef.child('projects_structure.json');
  wavRefLookup.then(function(lookup) {
    structureRef.getDownloadURL().then(function(url) {
      $.getJSON(url, function(data) {
        data["projects"].forEach(function(projectItem) {
          addProjectContent(projectItem, lookup[projectItem["dirname"]])
        })
      })
    })
  })
}

function readProjects(structureJson, topRef) {
  topRef.listAll().then(res => {
    console.log(res.prefixes.length);
    res.prefixes.forEach(projectRef => {
      addProjectBtn(structureJson[projectRef.name], projectRef);
    })
  })
}

async function parseStorage(topRef) {
  const wavRefLookup = {}
  
  topRef.listAll().then(function(res) {
    res.prefixes.forEach(function(userRef) {
      userRef.listAll().then(function(res) {
        res.prefixes.forEach(function(projectRef) {
          wavRefLookup[projectRef.name] = []
          projectRef.listAll().then(function(res) {
            res.prefixes.forEach(function(entryRef) {
              entryRef.listAll().then(function(res) {
                res.items.forEach(function(wavRef) {
                  wavRefLookup[projectRef.name].push(wavRef)
                })
              })
            })
          })
        })
      })
    });
  }).catch(function(error) {
    // Uh-oh, an error occurred!
  });
  return wavRefLookup
}
