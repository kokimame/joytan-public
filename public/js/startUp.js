function loadProjects(structureJson, topRef) {
  topRef.listAll().then(res => {
    console.log(res.prefixes.length);
    res.prefixes.forEach(projectRef => {
      addProjectBtn(structureJson[projectRef.name], projectRef);
    })
  })
}