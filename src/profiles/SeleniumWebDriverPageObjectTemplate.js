import lowerFirst from 'lodash/lowerFirst';

let minWidth = 0;

const getMinWidth = entities => {
  const longest = entities.reduce((p, c) => (p.name.length > c.name.length ? p : c));
  return longest.name.length + '  '.length;
};

const nameSpaces = name => ''.padEnd(minWidth - name.length, ' ');

const transformLocatorName = locatorName => {
  switch (locatorName) {
    case 'linkText':
      return 'visible_text';
    case 'partialLinkText':
      return 'visible_text';
    case 'tagName':
      return 'tag';
    default:
      return locatorName;
  }
};

const transformToPageObject = entity => {
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

const renderInclude =() => `
include PageObject 
include PageObject::PageFactory

`;

const renderLocatorName = entity => lowerFirst(entity.name);

const renderLocator = entity => {
  const locator = entity.locators.find(l => l.selected);
  return `${transformLocatorName(locator.name)}:'${locator.locator}'`;
};

const renderLocatorVariable = entity => `
${transformToPageObject(entity)}:${renderLocatorName(entity)},${nameSpaces(entity.name)}${renderLocator(entity)})`;

const renderLocators = entities => {
  minWidth = getMinWidth(entities);
  return `
  #---------- Page Objects -----------------${entities.map(entity => renderLocatorVariable(entity)).join('')}`;
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
  

export default model =>
  renderInclude() +
  renderLocators(model.entities) +
  renderAwait(model.entities) +
  renderScreenLoaded(model.entities);
