export class MyClass {

  data: {
    param: value
  };
  elements: HTMLElement[];

  constructor(parentContainer) {

    // do something

    this.createElements(parentContainer);
  }

  createElements(parentContainer) {

    // Create container for elements of this Class
    var elementsContainer = document.createElement(‘div’);

    // Create elements and append to elementsContainer
    const staticElement = document.createElement(HTMLElement);
    elementsContainer.appendChild(staticElement)

    // Push dynamic ones into class variable
    const dynamicElement = document.createElement(HTMLElement);
    elementsContainer.appendChild(dynamicElement)
    this.elements.push(dynamicElement);

    // Append Class container to parent container
    parentContainer.appendChild(elementsContainer);
  }

  updateData(obj: {param: value}) {

    // Check if data object has param and update it
    if (data[param]) {
      data[param] = value;
    }
    this.updateElements();
  }

  updateElements() {
    
    // update only the dynamic elements
  }
}


// Usage
// Create class and append it to element
const classInstance = new MyClass(parentContainer);

// Update class and re-render it
classInstance.updateData({param: value});