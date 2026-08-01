// Common Util
const _ = {
  // toArr: value =>
  camel2Kebab: str => str.split('').map(s => s === s.toUpperCase() ? `-${s.toLowerCase()}` : s).join(''),
  /**
   * Split input into array of even sized chunks
   * @param {string|array} input - input to chunk
   * @param {number} chunkSize - chunk input by every n size
   * @returns {array} of chunks from source input
   */
  splitToChunks: (arr, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i+=chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  },
  /**
   * Split input into array of even sized chunks starting from the last value
   * @param {string|array} input - input to chunk
   * @param {number} chunkSize - chunk input by every n size
   * @returns {array} of chunks from source input
   */
  splitToChunksRight: (arr, chunkSize) => {
    const chunks = [];
    for (let i = arr.length; i > 0; i-=chunkSize) {
      // chunks.push(arr.slice(i, i + chunkSize));
      chunks.unshift(arr.slice(Math.max(0, i - chunkSize), i));
      // console.log('splitToChunksRight', i - chunkSize, i, arr[i]);
    }


    // console.log('splitToChunksRight', chunks, arr, arr.length, chunkSize);

    return chunks;
  },
  getLabel: arr => {

    // NOTE: Not quite there but .... almost....
    // console.log('getLabel', arr);
    return 'null';
    let label = '';

    for (item of arr) {
      if (item || item > -1) {
        label = _.toStr(item);
        break;
      }
    }

    return label;
  },
  isNode: val => {
    return typeof val === 'object' ? Boolean(val.nodeType === 1) : false;
  },
  /**
   * Check if value is number
   * @param {*} value - value to check
   * @returns {boolean} true if number
   */
  isNumber: value => typeof value === 'number',
  num2Str: val => `${parseInt(val, 10)}`,
  toPx: num => `${num}px`,
  toStr: val => `${val}`,
  trimLeadingZeroes: string => {
    return string.split('.').map(s => {
      if (s.length > 1) {
        const fm = s.replace(/^0+/, '');
        return fm === '' ? DEFAULT_VALUE : fm;
      }
      return s;
    }).join('.');
  }
};

/**
 * Spawn DOM (The Document Object Model)
 * The Spawn Engine is a stateless virtual DOM generator.
 * @param {object|string} props - props of the Spawn
 * @param {element} props.parentEl - parent element to spawn into
 * @returns {element} reference of your Spawn
 */
 const Spawn = (props = {}) => {
  const {
    children = [],
    className,
    events,
    /**
     * @param {element}
     * If provided, will mount to the parent
     */
    parentEl,
    name,
    label,
    style,
    tag = 'div',
    // type = 'div',
    value,
    // Convert rest props to attrs
    ...restProps
  } = props;


  // if (props === 'JS Calculator') {
  //   debugger
  // }


  // Text node
  if (typeof props === 'string' || typeof props === 'number') {
    return document.createTextNode(props);
  }
  // Already DOM Element
  if (props instanceof HTMLElement) return props;

  // console.log('Spawn', props, props instanceof HTMLElement);

  const el = document.createElement(tag);

  const appendChildren = (children) => {
    // console.log('appendChildren', children, el);
    // convert to array
    let fmChildren = children;
    if (!Array.isArray(fmChildren)) {
      fmChildren = [fmChildren];
    }

    // each child...
    fmChildren.forEach(child => {
      el.appendChild(Spawn(child));
    });
  }

  // Attach Event Listeners
  // Assign {event} and {el} (self)
  if (events) {
    Object.keys(events).forEach(key => {
       el.addEventListener(key, e => events[key](e, el));
    });
  }

  // if (events) {
  //   Object.keys(events).forEach(key => {
  //      el.addEventListener(key, events[key]);
  //   });
  // }

  // Attach Style
  if (style) {
    el.setAttribute('style', Object.keys(style).map(key => {

      const trasodky = _.isNumber(style[key]);
      // console.log('trasodky', trasodky, style[key]);
      // number default to px
      let value = style[key];
      if (_.isNumber(value)) {
        value = _.toPx(value);
      }
      // if

      return `${_.camel2Kebab(key)}: ${value};`
    }).join(' '));
  }

  // Attach Class Name
  if (className) {
    el.setAttribute('class', className);
  }

  // const lblNode = _.getLabel([label, name, value]);
  // if (lblNode) {
  //   const lbl = document.createTextNode(lblNode);
  //   el.appendChild(lbl);
  // }

  // .. spread down the rest to html attrs
  Object.keys(restProps).forEach(key => el.setAttribute(key, restProps[key]));

  appendChildren(children);

  // Append to parent
  if (parentEl) {
    parentEl.appendChild(el);
  }

  return el;
};

export default Spawn;