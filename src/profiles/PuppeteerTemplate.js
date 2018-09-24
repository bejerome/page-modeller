import { isClickable, isInteractive } from './templates-helpers';

const renderEntityComment = entity => `
/*
 * ${entity.name}
 * ***************************************************************
 */
`;
const getSelectedLocator = entity => entity.locators.find(l => l.selected);
const renderGetElement = entity => {
  const locator = getSelectedLocator(entity);
  const method = locator.name === 'css' ? '$' : '$x'; // css or xpath
  return `
 async get${entity.name}Element() {
   return (await this.page.${method}(\`${locator.locator}\`))${locator.name === 'xpath' ? '[0]' : ''};
 }  
`;
};

const renderClickMethod = entity => {
  if (!isClickable(entity)) {
    return '';
  }
  return `
 async click${entity.name}() {
   this.get${entity.name}Element().click();
 }
`;
};

const renderGetAndSetCheckboxRadio = entity => `
 async get${entity.name}() {
   return await (await this.get${entity.name}Element().getProperty('checked')).jsonValue();
 }
 
 async set${entity.name}(onOrOff) {
   if( (onOrOff && !this.get${entity.name}()) || (!onOrOff && get${entity.name}())) {
     this.click${entity.name}(); 
   }
 }
`;

const renderGetAndSetSelect = entity => `
 async get${entity.name}Text() {
   const element = this.get${entity.name}Element();
   return await (await this.page.evaluate(el => el.options[el.selectedIndex].text, element));
 }
 
 async get${entity.name}Value() {
   const element = this.get${entity.name}Element();
   return await (await page.evaluate(el => el.options[el.selectedIndex].value, element));
 }
 
 async set${entity.name}ByValue(value) {
   const element = this.get${entity.name}Element();  
   await (await page.evaluate(el => {
     Array.from(el.options).find(o => o.value === value).selected = 'selected';
   }, element));
 }
 
 async set${entity.name}ByText(text) {
   const element = this.get${entity.name}Element();  
   await (await page.evaluate(el => {
     Array.from(el.options).find(o => o.text === text).selected = 'selected';
   }, element));
 }
`;

const renderGetAndSetMethods = entity => {
  if (['INPUT', 'TEXTAREA'].includes(entity.tagName)) {
    if (['checkbox', 'radio'].includes(entity.type)) {
      return renderGetAndSetCheckboxRadio(entity);
    }
    // regular input
    return `
 async get${entity.name}() {
   return await (await this.get${entity.name}Element().getProperty('value')).jsonValue();
 }
 
 async set${entity.name}(value) {
   get${entity.name}Element().type(value);
 }
 `;
  }
  if (entity.tagName === 'SELECT') {
    return renderGetAndSetSelect(entity);
  }
  return '';
};
const renderGetTextMethod = entity => {
  if (isInteractive(entity)) {
    return '';
  }

  return `
 async get${entity.name}() {
   const element = await this.get${entity.name}Element();
   return await this.page.evaluate(el => el.textContent, el);
 }
`;
};

export default model =>
  model.entities
    .map(entity => `${renderEntityComment(entity)}${renderGetElement(entity)}${renderClickMethod(entity)}${renderGetAndSetMethods(entity)}${renderGetTextMethod(entity)}`)
    .join('');