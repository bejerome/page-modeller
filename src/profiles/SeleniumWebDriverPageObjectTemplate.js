import lowerFirst from 'lodash/lowerFirst';
import { isClickable } from './templates-helpers';

let minWidth = 0;

const getMinWidth = entities => {
  const longest = entities.reduce((p, c) => (p.name.length > c.name.length ? p : c));
  return longest.name.length + '  '.length;
};

const nameSpaces = name => ''.padEnd(minWidth - name.length, ' ');

const transformLocatorName = locatorName => {
  switch (true) {
    case /text$/.test(locatorName.toLowerCase()):
      return 'visible_text';
    case /^class/.test(locatorName.toLowerCase()):
      return 'class';
    case /^tag/.test(locatorName.toLowerCase()):
      return 'tag';
    default:
      return locatorName;
  }
};

const transformWithCss = entity => {
  const locator = entity.locators.find(l => l.selected);
  switch (true) {
    case /^a/.test(locator.locator):
      return 'a(';
    case /^p/.test(locator.locator):
      return 'p(';
    case /^h2/.test(locator.locator):
      return 'h2(';
    case /^h1/.test(locator.locator):
      return 'h1(';
    case /^input/.test(locator.locator):
      return 'text_field(';
    case /^div/.test(locator.locator):
      return 'div(';
    default:  
      return 'element(';
  }
};

const transformToPageObject = entity => {
  const locator = entity.name.toLowerCase();
  
  switch (true) {
    case /btn$/.test(locator):
      return 'button(';
    case /field$/.test(locator):
      return 'text_field(';
    case /img$/.test(locator):
      return 'image(';
    case /h1$/.test(locator):
      return 'h1(';
    case /area$/.test(locator):
      return 'text_area(';
    case /link$/.test(locator):
      return 'link(';
    case /div$/.test(locator):
      return 'div(';
    case /lbl$/.test(locator):
      return 'label(';
    case /value$/.test(locator):
      return 'label(';
    default:  
      return transformWithCss(entity);
  }
};



const renderInclude =() => `
include PageObject 
include PageObject::PageFactory

`;

const renderLocatorName = entity => entity.name.toLowerCase();

const renderLocator = entity => {
  const locator = entity.locators.find(l => l.selected);
  let result;
  if (locator.name === "css" || locator.name === "xpath"){
    result = `${transformLocatorName(locator.name)}: "${locator.locator}"`;
  }else{ 
    result = `${transformLocatorName(locator.name)}: '${locator.locator}'`;   
  }
  return result;
};

const renderLocatorVariable = entity => `
${transformToPageObject(entity)}:${renderLocatorName(entity)},${nameSpaces(entity.name)}${renderLocator(entity)})`;

const renderLocators = entities => {
  minWidth = getMinWidth(entities);
  return `
  #---------- Page Objects -----------------
  ${entities.map(entity => renderLocatorVariable(entity)).join('')}
  
  #---------- Page Objects End -----------------`
};

const renderAwait = entities => `

def await
  CXA::Web.lazy_check_element(self, '${entities.map(entity => renderLocatorName(entity)).join("','")}')
  CXA.output_text 'I am on page'
end
`;

const renderScreenLoaded = entities => `

def screen_loaded
  CXA::Web.lazy_check_element(self, '${entities.map(entity => renderLocatorName(entity)).join("','")}')
  CXA.output_text 'page loaded'
end
`;

const renderClickMethod = entity => {
  if (!isClickable(entity)) {
    return '';
  }
  return `
 def click_on_${lowerFirst(entity.name)}
  ${lowerFirst(entity.name)}
  CXA.output_text 'clicked on ${lowerFirst(entity.name)}'
 end
`;
};

 

export default model =>
  renderInclude() +
  renderLocators(model.entities) +
  renderAwait(model.entities) +
  renderScreenLoaded(model.entities) +
  model.entities
  .map(entity => `${renderClickMethod(entity)}`)
  .join('');
