#target indesign;

main();

function fuzzyIndex(list, string) {
  for(var i = 0; i < list.length; i++) {
    if(list[i].indexOf(string) != -1) {
      return i;
    }
  }  
  
  return 0;
}

function main() {  
  app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
  
  if(app.documents.length > 0) {
    styleOptionDialog();
  } else {
    alert("No documents are open. Please open a document and try again.");
  }
}

function styleOptionDialog() {
  var dialog    = app.dialogs.add({ name: 'Markdown' });
  var selected  = {};
  var styles    = {};
  var range;
  
  var paragraphStyles = app.activeDocument.allParagraphStyles;
  var characterStyles = app.activeDocument.allCharacterStyles;
  
  var paragraphStyleNames = [];
  for (var i=0; i < paragraphStyles.length; i++) {
    paragraphStyleNames[i] = paragraphStyles[i].name;
  }
  
  var characterStyleNames = [];
  for (var i=0; i < characterStyles.length; i++) {
    characterStyleNames[i] = characterStyles[i].name;
  }
  
  var minWidth = 100;
  
  with(dialog.dialogColumns.add()) {
    with(dialogRows.add()){
      with(dialogColumns.add()) {
        staticTexts.add({ staticLabel: 'Search Range' });
      }
      
      range = radiobuttonGroups.add();
      with(range) {
        if(app.selection.length > 0) {
          radiobuttonControls.add({
            staticLabel: 'Selected Story',
            checkedState: true
          });
          
          radiobuttonControls.add({
            staticLabel: 'Document'
          });
        } else {
          radiobuttonControls.add({
            staticLabel: 'Document',
            checkedState: true
          });
        }
      }     
    }
    
    with(dialogRows.add()) {      
      with(dialogColumns.add()) {
        staticTexts.add({ staticLabel: 'Headings' });
        
        with(borderPanels.add()) {
          with(dialogColumns.add()) {
            staticTexts.add({ staticLabel: 'Heading 1 (H1)' });

            selected.h1 = dropdowns.add({ 
              stringList: paragraphStyleNames,
              selectedIndex: fuzzyIndex(paragraphStyleNames, '(H1)'),
              minWidth: minWidth
            });

            staticTexts.add({ staticLabel: 'Heading 2 (H2)' });

            selected.h2 = dropdowns.add({
              stringList: paragraphStyleNames,
              selectedIndex: fuzzyIndex(paragraphStyleNames, '(H2)'),
              minWidth: minWidth
            });

            staticTexts.add({ staticLabel: 'Heading 3 (H3)' });

            selected.h3 = dropdowns.add({
              stringList: paragraphStyleNames,
              selectedIndex: fuzzyIndex(paragraphStyleNames, '(H3)'),
              minWidth: minWidth
            });
          }
        }
      }
      
      with(dialogColumns.add()) {
        staticTexts.add({ staticLabel: 'Lists' });
        
        with(borderPanels.add()) {
          with(dialogColumns.add()) {
            staticTexts.add({ staticLabel: 'Ordered List (OL)' });
        
            selected.ol = dropdowns.add({ 
              stringList: paragraphStyleNames,
              selectedIndex: fuzzyIndex(paragraphStyleNames, '(OL)'),
              minWidth: minWidth
            });
        
            staticTexts.add({ staticLabel: 'Unordered List (UL)' });
        
            selected.ul = dropdowns.add({
              stringList: paragraphStyleNames,
              selectedIndex: fuzzyIndex(paragraphStyleNames, '(UL)'),
              minWidth: minWidth
            });
          }
        }
      }
      
      with(dialogColumns.add()) {
        staticTexts.add({ staticLabel: 'Formattings' });
        
        with(borderPanels.add()) {
          with(dialogColumns.add()) {            
            staticTexts.add({ staticLabel: 'Emphasized (EM)' });
        
            selected.em = dropdowns.add({
              stringList: characterStyleNames,
              selectedIndex: fuzzyIndex(characterStyleNames, '(EM)'),
              minWidth: minWidth
            });
        
            staticTexts.add({ staticLabel: 'Strong (ST)' });
        
            selected.strong = dropdowns.add({
              stringList: characterStyleNames,
              selectedIndex: fuzzyIndex(characterStyleNames, '(ST)'),
              minWidth: minWidth
            });
        
            staticTexts.add({ staticLabel: 'CODE (CD)' });
        
            selected.code = dropdowns.add({
              stringList: characterStyleNames,
              selectedIndex: fuzzyIndex(characterStyleNames, '(CD)'),
              minWidth: minWidth
            });
          }
        }
      }
    }
  }
  
  if(dialog.show()) {
    styles.h1     = paragraphStyles[selected.h1.selectedIndex];
    styles.h2     = paragraphStyles[selected.h2.selectedIndex];
    styles.h3     = paragraphStyles[selected.h3.selectedIndex];
    
    styles.ol     = paragraphStyles[selected.ol.selectedIndex];
    styles.ul     = paragraphStyles[selected.ul.selectedIndex];
    
    styles.em     = characterStyles[selected.em.selectedIndex];
    styles.strong = characterStyles[selected.strong.selectedIndex];
    styles.code   = characterStyles[selected.code.selectedIndex];
    
    switch(range.selectedButton) {
      case 0:
        target = app.documents.item(0);
        break;
      case 1:
        target = app.selection[0] ? app.selection[0].parentStory : null;
        break;
    }
    
    dialog.destroy();
    
    if(target) {
      markdown(target, styles);
    }
  } else {
    dialog.destroy();
  }
}

function markdown(target, styles) {
  var replacements = [{
    name:     'Heading 3',
    find:     { findWhat: '^###\\s+(.+)\\s+$' },
    change:   { changeTo: "$1\r", appliedParagraphStyle: styles.h3 }
  }, {
    name:     'Heading 2',
    find:     { findWhat: '^##\\s+(.+)\\s+$' },
    change:   { changeTo: "$1\r", appliedParagraphStyle: styles.h2 }
  }, {
    name:     'Heading 1',
    find:     { findWhat: '^#\\s+(.+)\\s+$' },
    change:   { changeTo: "$1\r", appliedParagraphStyle: styles.h1 }
  }, {
    name:     'Ordered List',
    find:     { findWhat: '^\\d+\\.\\s+(.+)$' },
    change:   { changeTo: "$1", appliedParagraphStyle: styles.ol }
  }, {
    name:     'Unordered List',
    find:     { findWhat: '^[-\\*\\+]\\s+(.+)$' },
    change:   { changeTo: "$1", appliedParagraphStyle: styles.ul }
  }, {
    name:     'Strong',
    find:     { findWhat: '__([^_]+)__' },
    change:   { changeTo: '$1', appliedCharacterStyle: styles.strong }
  }, {
    name:     'Emphasized',
    find:     { findWhat: '_([^_]+)_' },
    change:   { changeTo: '$1', appliedCharacterStyle: styles.em }
  }, {
    name:     'Code',
    find:     { findWhat: '`([^_]+)`' },
    change:   { changeTo: '$1', appliedCharacterStyle: styles.code }
  }, {
    name:     'Line Breaks',
    find:     { findWhat: '~b~b+' },
    change:   { changeTo: "\r" }
  }];
  
  var debug = [];
  
  for(var i = 0; i < replacements.length; i++) {
    var foundItems = runGrep(target, replacements[i]);
      
    debug.push(foundItems.length.toString() + 'x ' + replacements[i].name);
  }
  
  debug.sort();
  debug.unshift('Markdown Replacements');
  var message = debug.join("\n");
  
  alert(message);
}

function runGrep(target, options) {
  app.findGrepPreferences.properties    = options.find;
  app.changeGrepPreferences.properties  = options.change;
  
  var foundItems = target.changeGrep();
  
  app.findGrepPreferences   = NothingEnum.nothing;
  app.changeGrepPreferences = NothingEnum.nothing;
  
  return foundItems;
}
