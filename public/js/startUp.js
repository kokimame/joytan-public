function loadProjects(structureJson, topRef) {
  topRef.listAll().then(res => {
    res.prefixes.forEach(projectRef => {
      addProjectBtn(structureJson[projectRef.name], projectRef);
    })
  })
}