const flatten = require('flat');
const unflatten = require('flat').unflatten;

function isArray(what) {
  return Object.prototype.toString.call(what) === '[object Array]';
}
const findLength = function(jsonToCheck, expectedLength) {
  switch (typeof expectedLength) {
    case 'number':
      if (Object.prototype.toString.call(jsonToCheck) === '[object Array]') {
        return (jsonToCheck.length === expectedLength);
      } else if (typeof jsonToCheck === 'object') {
        return (Object.keys(jsonToCheck).length === expectedLength);
      }
      return (jsonToCheck.length === expectedLength);
    default:
      if (Object.prototype.toString.call(jsonToCheck) === '[object Array]') {
        return ((jsonToCheck.length >= expectedLength[0]) && (jsonToCheck.length <= expectedLength[1]));
      } else if (typeof jsonToCheck === 'object') {
        return ((Object.keys(jsonToCheck).length >= expectedLength[0]) &&
          (Object.keys(jsonToCheck).length <= expectedLength[1]));
      } else if (typeof jsonToCheck === 'string') {
        return ((jsonToCheck.length >= expectedLength[0]) && (jsonToCheck.length <= expectedLength[1]));
      }
      return ((jsonToCheck >= expectedLength[0]) && (jsonToCheck <= expectedLength[1]));
  }
};
const checkDuplicates = function(pathToField, jsonToCheck) {
  const flatJson = flatten(jsonToCheck);
  const badNodeList = [];
  const duplist = [];
  for (const value in flatJson) {
    if (value.match(pathToField)) {
      const field = pathToField.split('.').pop();
      for (let i = 0; i < duplist.length; i++) {
        if (duplist[i] === flatJson[value]) {
          badNodeList.push(value);
        }
      }
      duplist.push(flatJson[value]);
    }
  }
  if (badNodeList.length > 1) {
    return [false, JSON.stringify(badNodeList) + ' are duplicates'];
  }
  return [true, 'OK'];
};
const findJsonField = function(path, jsonToCheck, fieldName, mode, root) {
  if ((path.indexOf('.') < 0) || (path === '.')) {
    const badNodeList = [];
    let count = 0;
    switch (path) {
      case '*':
        for (let i = 0; i < jsonToCheck.length; i++) {
          if (findField(jsonToCheck[i], fieldName)) {
            count++;
          } else {
            badNodeList.push(i);
          }
        }
        if (count === jsonToCheck.length) {
          return [true, 'OK'];
        };
        return [false, root + '(' + badNodeList + ')'];
      case '?':
        for (let i = 0; i < jsonToCheck.length; i++) {
          if (findField(jsonToCheck[i], fieldName)) {
            count++;
          }
        }
        if (count > 1) {
          return [true, 'OK'];
        }
        return [false, root + '(All)'];
      case '.':
        if (findField(jsonToCheck, fieldName)) {
          return [true, 'OK'];
        }
        return [false, ''];
      default:
        if (findField(jsonToCheck[path], fieldName)) {
          return [true, 'OK'];
        }
        return [false, ''];
    }
  } else {
    let restofpathstr;
    let restofpath = [];
    const pathArr = path.split('.');
    if ((pathArr[0] !== '*') && (pathArr[0] !== '?')) {
      root = pathArr[0];
    }
    const badNodeList = [];

    let count = 0;
    switch (pathArr[0]) {
      case '*':
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        for (let j = 0; j < jsonToCheck.length; j++) {
          const result = findJsonField(restofpathstr, jsonToCheck[j], fieldName, mode, root);
          if (!result[0]) {
            badNodeList.push(root + '[' + j + '] ' + result[1]);
          } else {
            count++;
          }
        }
        if (count === jsonToCheck.length) {
          return [true, 'OK'];
        }
        return [false, badNodeList];
      case '?':
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        for (let j = 0; j < jsonToCheck.length; j++) {
          const result = findJsonField(restofpathstr, jsonToCheck[j], fieldName, mode, root);
          if (result[0]) {
            count++;
          } else {
            badNodeList.push(root + '[' + j + '] ' + result[1]);
          }
        }
        if (count < 1) {
          return [false, badNodeList];
        }
        return [true, 'OK'];
      default:
        jsonToCheck = jsonToCheck[pathArr[0]];
        if ((typeof jsonToCheck === 'undefined') && (mode === 'strict')) {
          return [false, pathArr[0] + ' not present'];
        } else if ((typeof jsonToCheck === 'undefined') && (mode === 'relaxed')) {
          return [true, 'OK'];
        }
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        const result = findJsonField(restofpathstr, jsonToCheck, fieldName, mode, root);
        if (result[0]) {
          return [true, 'OK'];
        }
        return [false, result[1] + ''];
    }
  }
};
const findJsonLength = function(path, jsonToCheck, expectedLength, mode, root) {
  if ((path.indexOf('.') < 0) || (path === '.')) {
    const badNodeList = [];
    let count = 0;
    switch (path) {
      case '*':
        for (let i = 0; i < jsonToCheck.length; i++) {
          if (findLength(jsonToCheck[i], expectedLength)) {
            count++;
          } else {
            badNodeList.push(i);
          }
        }
        if (count === jsonToCheck.length) {
          return [true, 'OK'];
        }
        return [false, root + '(' + badNodeList + ')'];
      case '?':
        for (let i = 0; i < jsonToCheck.length; i++) {
          if (findLength(jsonToCheck[i], expectedLength)) {
            count++;
          }
        }
        if (count > 1) {
          return [true, 'OK'];
        }
        return [false, root + '(All)'];
      case '.':
        if (findLength(jsonToCheck, expectedLength)) {
          return [true, 'OK'];
        }
        return [false, ''];
      default:
        if (findLength(jsonToCheck[path], expectedLength)) {
          return [true, 'OK'];
        }
        return [false, ''];
    }
  } else {
    let restofpathstr;
    let restofpath = [];
    const pathArr = path.split('.');
    if ((pathArr[0] !== '*') && (pathArr[0] !== '?')) {
      root = pathArr[0];
    }
    const badNodeList = [];
    let count = 0;
    switch (pathArr[0]) {
      case '*':
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        for (let j = 0; j < jsonToCheck.length; j++) {
          const result = findJsonLength(restofpathstr, jsonToCheck[j], expectedLength, mode, root);
          if (!result[0]) {
            badNodeList.push(root + '[' + j + '] ' + result[1]);
          } else {
            count++;
          }
        }
        if (count === jsonToCheck.length) {
          return [true, 'OK'];
        }
        return [false, badNodeList];
      case '?':
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        for (let j = 0; j < jsonToCheck.length; j++) {
          const result = findJsonLength(restofpathstr, jsonToCheck[j], expectedLength, mode, root);
          if (result[0]) {
            count++;
          } else {
            badNodeList.push(root + '[' + j + '] ' + result[1]);
          }
        }
        if (count < 1) {
          return [false, badNodeList];
        }
        return [true, 'OK'];
      default:
        jsonToCheck = jsonToCheck[pathArr[0]];
        if ((typeof jsonToCheck === 'undefined') && (mode === 'strict')) {
          return [false, pathArr[0] + ' not present'];
        } else if ((typeof jsonToCheck === 'undefined') && (mode === 'relaxed')) {
          return [true, 'OK'];
        }
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        const result = findJsonLength(restofpathstr, jsonToCheck, expectedLength, mode, root);
        if (result[0]) {
          return [true, 'OK'];
        }
        return [false, result[1] + ''];
    }
  }
};
const findJsonValues = function(path, jsonToCheck, inputJson, mode, root) {
  if ((path.indexOf('.') < 0) || (path === '.')) {
    const badNodeList = [];
    let count = 0;
    switch (path) {
      case '*':
        for (let i = 0; i < jsonToCheck.length; i++) {
          if (findJson(jsonToCheck[i], inputJson, mode)) {
            count++;
          } else {
            badNodeList.push(i);
          }
        }
        if (count === jsonToCheck.length) {
          return [true, 'OK'];
        }
        return [false, root + '(' + badNodeList + ')'];
      case '?':
        for (let i = 0; i < jsonToCheck.length; i++) {
          if (findJson(jsonToCheck[i], inputJson, mode)) {
            count++;
          }
        }
        if (count > 1) {
          return [true, 'OK'];
        }
        return [false, root + '(All)'];
      case '.':
        if (findJson(jsonToCheck, inputJson, mode)) {
          return [true, 'OK'];
        }
        return [false, ''];
      default:
        if (findJson(jsonToCheck[path], inputJson, mode)) {
          return [true, 'OK'];
        }
        return [false, ''];
    }
  } else {
    let restofpathstr;
    let restofpath = [];
    const pathArr = path.split('.');
    if ((pathArr[0] !== '*') && (pathArr[0] !== '?')) {
      root = pathArr[0];
    }
    const badNodeList = [];
    let count = 0;
    switch (pathArr[0]) {
      case '*':
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        for (let j = 0; j < jsonToCheck.length; j++) {
          const result = findJsonValues(restofpathstr, jsonToCheck[j], inputJson, mode, root);
          if (!result[0]) {
            badNodeList.push(root + '[' + j + '] ' + result[1]);
          } else {
            count++;
          }
        }
        if (count === jsonToCheck.length) {
          return [true, 'OK'];
        }
        return [false, badNodeList];
      case '?':
        restofpath = [];
        for (
        let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        for (let j = 0; j < jsonToCheck.length; j++) {
          const result = findJsonValues(restofpathstr, jsonToCheck[j], inputJson, mode, root);
          if (result[0]) {
            count++;
          } else {
            badNodeList.push(root + '[' + j + '] ' + result[1]);
          }
        }
        if (count < 1) {
          return [false, badNodeList];
        }
        return [true, 'OK'];
      default:
        jsonToCheck = jsonToCheck[pathArr[0]];
        if ((typeof jsonToCheck === 'undefined') && ((mode === 'strict_notnull') || (mode === 'strict_null'))) {
          return [false, pathArr[0] + ' not present'];
        } else if ((typeof jsonToCheck === 'undefined') && ((mode === 'relaxed_notnull') ||
          (mode === 'relaxed_null'))) {
          return [true, 'OK'];
        }
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        const result = findJsonValues(restofpathstr, jsonToCheck, inputJson, mode, root);
        if (result[0]) {
          return [true, 'OK'];
        }
        return [false, result[1] + ''];
    }
  }
};

function find(json, key, value, mode) {
  let result = [];
  let found = false;
  for (const property in json) {
    if (json.hasOwnProperty(property)) {
      if (property === key && json[property] === value) {
        found = true;
        return true;
      }
      if (isArray(json[property])) {
        if (typeof json[property][0] !== 'Object') {
          return (json[property].toString() === value.toString());
        }
        for (const child in json[property]) {
          const res = find(json[property][child], key, value);
          if (res) {
            return true;
          }
        }
      }
    }
  }
  if ((found === false) && ((mode === 'strict_null') || (mode === 'relaxed_null'))) {
    return true;
  } else if ((found === false) && (typeof json === 'undefined') &&
    ((mode === 'relaxed_null') || (mode === 'relaxed_notnull'))) {
    return true;
  }
  return false;
}
const translateToFirstJson = function(json1, json2, fieldmap, mode) {
  let errorString = '';
  let newJson;
  for (let i = 0; i < fieldmap.length; i++) {
    newJson = {};
    const map = fieldmap[i];
    const field = Object.keys(map)[0];
    const mapvalue = map[Object.keys(map)[0]];
    const fieldParts = field.split('*');
    const mapping = {};
    const mapvalueParts = mapvalue.split('*');
    if (fieldParts.length !== mapvalueParts.length) {
      return [false, 'Invalid mapping'];
      //deferred.reject(new Error('Invalid mapping'));
    }
    for (const part in fieldParts) {
      if (fieldParts[part].charAt(fieldParts[part].length - 1) === '.') {
        fieldParts[part] = fieldParts[part].substring(0, fieldParts[part].length - 1);
      }
      if (fieldParts[part].charAt(0) === '.') {
        fieldParts[part] = fieldParts[part].substring(1);
      }
      if (mapvalueParts[part].charAt(mapvalueParts[part].length - 1) === '.') {
        mapvalueParts[part] = mapvalueParts[part].substring(0, mapvalueParts[part].length - 1);
      }
      if (mapvalueParts[part].charAt(0) === '.') {
        mapvalueParts[part] = mapvalueParts[part].substring(1);
      }
      mapping[part] = JSON.parse('{ \'' + mapvalueParts[part] + '\': \'' + fieldParts[part] + '\'}');
      const json2flat = flatten(json2);
      let newstring;
      let checkifarray;
      let checkjson = JSON.parse(JSON.stringify(json2));
      let json2flatParts = [];
      let copyArray = [];
      let levelWord = '';
      let fieldpartsval;
      let index = 0;
      let ind;
      for (const val in json2flat) {
        fieldpartsval = val.split('.');
        while (index < fieldpartsval.length) {
          if (isNaN(fieldpartsval[index])) {
            levelWord += fieldpartsval[index] + '.';
          } else { //encountered a number
            levelWord = levelWord.substring(0, levelWord.length - 1);
            checkifarray = levelWord.split('.');
            for (let k = 0; k < checkifarray.length; k++) {
              checkjson = checkjson[checkifarray[k]];
            }
            if (checkjson instanceof Array) {
              json2flatParts.push({ 'field': levelWord });
              json2flatParts.push({ 'number': fieldpartsval[index] });
              levelWord = '';
            } else {
              levelWord += '.' + fieldpartsval[index] + '.';
            }
          }
          index++;
          checkjson = JSON.parse(JSON.stringify(json2));
        }
        levelWord = levelWord.substring(0, levelWord.length - 1);
        json2flatParts.push({ 'field': levelWord });
        //console.log('JSON2FLATPARTS '+ JSON.stringify(json2flatParts));
        ind = 0;
        for (const pt in json2flatParts) {
          //console.log('Key '+Object.keys(json2flatParts[pt])[0]);
          if (Object.keys(json2flatParts[pt])[0] === 'number') {
            ind++;
            continue;
          } else {
            if (mapping[ind]) {
              if (json2flatParts[pt][Object.keys(json2flatParts[pt])[0]] === Object.keys(mapping[ind])[0]) {
                json2flatParts[pt][Object.keys(json2flatParts[pt])[0]] = mapping[ind][Object.keys(mapping[ind])[0]];
              }
            }
          }
        }
        for (const pt in json2flatParts) {
          copyArray.push(json2flatParts[pt][Object.keys(json2flatParts[pt])[0]]);
        }
        newstring = copyArray.join('.');
        newJson[newstring] = json2flat[val];
        newstring = '';
        index = 0;
        ind = 0;
        levelWord = '';
        copyArray = [];
        checkjson = JSON.parse(JSON.stringify(json2));
        json2flatParts = [];
      }
      const fieldParts = field.split('.');
      const topfield = fieldParts.pop();
      let fieldpath = fieldParts.join('.');
      if (fieldpath.length === 0) {
        fieldpath = '.';
      }
      const result = compareFields(fieldpath, json1, unflatten(newJson), topfield, mode, '.');
      if (!result[0]) {
        errorString += result[1] + ' - Field ' + field + ',';
      }
    }
  }
  if (errorString.length === 0) {
    return [true, JSON.stringify(newJson)];
  }
  return [false, errorString];
};
const compareFieldValue = function(jsonToCheck1, jsonToCheck2, fieldName, mode) {
  if ((typeof jsonToCheck1 === 'undefined') && (typeof jsonToCheck2 === 'undefined') && (mode === 'relaxed')) {
    return true;
  } else if ((typeof jsonToCheck1 === 'undefined') && (typeof jsonToCheck2 !== 'undefined')) {
    return false;
  } else if ((typeof jsonToCheck1 !== 'undefined') && (typeof jsonToCheck2 === 'undefined')) {
    return false;
  }
  if ((typeof jsonToCheck1[fieldName] === 'undefined') &&
    (typeof jsonToCheck2[fieldName] === 'undefined') && (mode === 'relaxed')) {
    return true;
  } else if ((typeof jsonToCheck1[fieldName] === 'undefined') && (typeof jsonToCheck2[fieldName] !== 'undefined')) {
    return false;
  } else if ((typeof jsonToCheck1[fieldName] !== 'undefined') && (typeof jsonToCheck2[fieldName] === 'undefined')) {
    return false;
  } else if ((typeof jsonToCheck1[fieldName] === 'undefined') &&
    (typeof jsonToCheck2[fieldName] === 'undefined') && (mode === 'strict')) {
    return false;
  }
  if (Object.prototype.toString.call(jsonToCheck1[fieldName]) === '[object Array]') {
    return (jsonToCheck1[fieldName].length === jsonToCheck2[fieldName].length);
  } else if (typeof jsonToCheck1[fieldName] === 'object') {
    return (Object.keys(jsonToCheck1[fieldName]).length === Object.keys(jsonToCheck2[fieldName]).length);
  }
  if ((!isNaN(jsonToCheck1[fieldName])) && (!isNaN(jsonToCheck2[fieldName]))) {
    return (Number(jsonToCheck1[fieldName]) === Number(jsonToCheck2[fieldName]));
  }
  return (jsonToCheck1[fieldName] === jsonToCheck2[fieldName]);
};
const compareFields = function(path, jsonToCheck1, jsonToCheck2, fieldName, mode, root) {
  if ((path.indexOf('.') < 0) || (path === '.')) {
    const badNodeList = [];
    let count = 0;
    switch (path) {
      case '*':
        for (let i = 0; i < jsonToCheck1.length; i++) {
          if (compareFieldValue(jsonToCheck1[i], jsonToCheck2[i], fieldName, mode)) {
            count++;
          } else {
            badNodeList.push(i);
          }
        }
        if (count === jsonToCheck1.length) {
          return [true, 'OK'];
        }
        return [false, root + '(' + badNodeList + ')'];
      case '?':
        for (let i = 0; i < jsonToCheck1.length; i++) {
          if (compareFieldValue(jsonToCheck1[i], jsonToCheck2[i], fieldName, mode)) {
            count++;
          }
        }
        if (count > 1) {
          return [true, 'OK'];
        }
        return [false, root + '(All)'];
      case '.':
        if (compareFieldValue(jsonToCheck1, jsonToCheck2, fieldName, mode)) {
          return [true, 'OK'];
        }
        return [false, ''];
      default:
        if (compareFieldValue(jsonToCheck1[path], jsonToCheck2[path], fieldName, mode)) {
          return [true, 'OK'];
        }
        return [false, ''];
    }
  } else {
    let restofpathstr;
    let restofpath = [];
    const pathArr = path.split('.');
    if ((pathArr[0] !== '*') && (pathArr[0] !== '?')) {
      root = pathArr[0];
    }
    const badNodeList = [];
    let count = 0;
    let minLength;
    switch (pathArr[0]) {
      case '*':
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        minLength = jsonToCheck1.length;
        let unequal = false;
        if (jsonToCheck1.length !== jsonToCheck2.length) {
          if (jsonToCheck1.length > jsonToCheck2.length) {
            minLength = jsonToCheck2.length;
            if (mode === 'strict') {
              unequal = true;
              for (let j = jsonToCheck2.length; j < jsonToCheck1.length; j++) {
                badNodeList.push(root + '[' + j + '] ' + 'not present in json 2');
              }
            }
          } else {
            minLength = jsonToCheck1.length;
            if (mode === 'strict') {
              unequal = true;
              for (let j = jsonToCheck1.length; j < jsonToCheck2.length; j++) {
                badNodeList.push(root + '[' + j + '] ' + 'not present in json 1');
              }
            }
          }
        }
        for (let j = 0; j < minLength; j++) {
          const result = compareFields(restofpathstr, jsonToCheck1[j], jsonToCheck2[j], fieldName, mode, root);
          if (!result[0]) {
            badNodeList.push(root + '[' + j + '] ' + result[1]);
          } else {
            count++;
          }
        }
        if ((count === minLength) && (!unequal)) {
          return [true, 'OK'];
        }
        return [false, badNodeList];
      case '?':
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        if (jsonToCheck1.length !== jsonToCheck2.length) {
          if (jsonToCheck1.length > jsonToCheck2.length) {
            minLength = jsonToCheck2.length;
          } else {
            minLength = jsonToCheck1.length;
          }
        }
        for (let j = 0; j < minLength; j++) {
          const result = compareFields(restofpathstr, jsonToCheck1[j], jsonToCheck2[j], fieldName, mode, root);
          if (result[0]) {
            count++;
          } else {
            badNodeList.push(root + '[' + j + '] ' + result[1]);
          }
        }
        if (count < 1) {
          return [false, badNodeList];
        }
        return [true, 'OK'];
      default:
        jsonToCheck1 = jsonToCheck1[pathArr[0]];
        jsonToCheck2 = jsonToCheck2[pathArr[0]];
        if ((typeof jsonToCheck1 === 'undefined') && (mode === 'strict')) {
          return [false, pathArr[0] + ' not present in json 1'];
        } else if ((typeof jsonToCheck2 === 'undefined') && (mode === 'strict')) {
          return [false, pathArr[0] + ' not present in json 2'];
        } else if ((typeof jsonToCheck1 === 'undefined') && (typeof jsonToCheck2 === 'undefined') &&
          (mode === 'relaxed')) {
          return [true, 'OK'];
        } else if ((typeof jsonToCheck1 === 'undefined') && (mode === 'relaxed')) {
          //return [false, pathArr[0]+' present in json 2 but not in json 1'];
          return [true, 'OK'];
        } else if ((typeof jsonToCheck2 === 'undefined') && (mode === 'relaxed')) {
          //return [false, pathArr[0]+' present in json 1 but not in json 2'];
          return [true, 'OK'];
        }
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        const result = compareFields(restofpathstr, jsonToCheck1, jsonToCheck2, fieldName, mode, root);
        if (result[0]) {
          return [true, 'OK'];
        }
        return [false, result[1] + ''];
    }
  }
};
const compareFieldValueWithMap = function(json1, json2, fieldMap) {
  if (Object.prototype.toString.call(jsonToCheck1[Object.keys(fieldMap)[0]]) === '[object Array]') {
    return (jsonToCheck1[fieldName].length === jsonToCheck2[fieldName].length);
  }
  if (jsonToCheck1[Object.keys(fieldMap)[0]] === jsonToCheck2[fieldMap[Object.keys(fieldMap)[0]]]) {
    return true;
  }
  return false;
};
const quickParser = function(json, path) {
  const pathParts = path.split('.');
  for (const pt in pathParts) {
    json = json[pathParts[pt]];
  }
  return json;
};
const compareFieldsWithMap = function(path1, path2, jsonToCheck1, jsonToCheck2, fieldMap, mode, root1, root2) {
  if ((path1.indexOf('.') < 0) || (path1 === '.')) {
    let badNodeList = [];
    let count = 0;
    switch (path1) {
      case '*':
        for (let i = 0; i < jsonToCheck1.length; i++) {
          if (compareFieldValueWithMap(jsonToCheck1[i], jsonToCheck2[i], fieldMap)) {
            count++;
          } else {
            badNodeList.push(i);
          }
        }
        if (count === jsonToCheck1.length) {
          return [true, 'OK'];
        }
        return [false, root + '(' + badNodeList + ')'];
      case '.':
        if (compareFieldValueWithMap(jsonToCheck1, jsonToCheck2, fieldMap)) {
          return [true, 'OK'];
        }
        return [false, ''];
      default:
        if (compareFieldValueWithMap(jsonToCheck1[path1], jsonToCheck2[path2], fieldMap)) {
          return [true, 'OK'];
        }
        return [false, ''];
    }
  } else {
    let restofpathstr1;
    let restofpath1 = [];
    let restofpathstr2;
    let restofpath2 = [];
    let restofpath = [];
    let pathArr1 = path1.split('*');
    let newPathArr = [];
    let newPathArr2;
    let restofpathstr;
    const pathArr = [];
    if (pathArr1.length > 1) {
      for (let i = 0; i < pathArr1.length; i++) {
        if (pathArr1[i] !== '') {
          newPathArr.push(pathArr1[i]);
        }
        if (i < pathArr1.length - 1) {
          newPathArr.push('*');
        }
      }
      pathArr1 = newPathArr;
    }
    newPathArr = [];
    let pathArr2 = path2.split('*');
    if (pathArr2.length > 1) {
      for (let i = 0; i < pathArr2.length; i++) {
        if (pathArr2[i] !== '') {
          newPathArr.push(pathArr2[i]);
        }
        if (i < pathArr2.length - 1) {
          newPathArr2.push('*');
        }
      }
      pathArr2 = newPathArr;
    }
    if ((pathArr1[0] !== '*') && (pathArr1[0] !== '?')) {
      root1 = pathArr1[0];
    }
    if ((pathArr2[0] !== '*') && (pathArr2[0] !== '?')) {
      root2 = pathArr2[0];
    }
    const badNodeList = [];
    let count = 0;
    switch (pathArr1[0]) {
      case '*':
        restofpath1 = [];
        for (let k = 1; k < pathArr1.length; k++) {
          restofpath1.push(pathArr1[k]);
        }
        restofpathstr1 = restofpath1.join('.');
        for (let k = 1; k < pathArr2.length; k++) {
          restofpath2.push(pathArr2[k]);
        }
        restofpathstr2 = restofpath2.join('.');
        let minLength = jsonToCheck1.length;
        let unequal = false;
        let fieldName;
        if (jsonToCheck1.length !== jsonToCheck2.length) {
          if (jsonToCheck1.length > jsonToCheck2.length) {
            minLength = jsonToCheck2.length;
            if (mode === 'strict') {
              unequal = true;
              for (let j = jsonToCheck2.length; j < jsonToCheck1.length; j++) {
                badNodeList.push(root2 + '[' + j + '] ' + 'not present in json 2');
              }
            }
          } else {
            minLength = jsonToCheck1.length;
            if (mode === 'strict') {
              unequal = true;
              for (let j = jsonToCheck1.length; j < jsonToCheck2.length; j++) {
                badNodeList.push(root1 + '[' + j + '] ' + 'not present in json 1');
              }
            }
          }
        }
        for (let j = 0; j < minLength; j++) {
          const result = compareFieldsWithMap(restofpathstr1, restofpathstr2,
            jsonToCheck1[j], jsonToCheck2[j], fieldName, mode, root1, root2);
          if (!result[0]) {
            badNodeList.push(root1 + '[' + j + '] ' + result[1]);
          } else {
            count++;
          }
        }
        if ((count === minLength) && (!unequal)) {
          return [true, 'OK'];
        }
        return [false, badNodeList];
      default:
        jsonToCheck1 = quickParser(jsonToCheck1, pathArr1[0]);
        jsonToCheck2 = quickParser(jsonToCheck2, pathArr2[0]);
        //console.log(JSON.stringify(jsonToCheck1));
        //console.log(JSON.stringify(jsonToCheck2));
        if ((typeof jsonToCheck1 === 'undefined') && (mode === 'strict')) {
          return [false, pathArr1[0] + ' not present in json 1'];
        } else if ((typeof jsonToCheck2 === 'undefined') && (mode === 'strict')) {
          return [false, pathArr2[0] + ' not present in json 2'];
        } else if ((typeof jsonToCheck1 === 'undefined') &&
          (typeof jsonToCheck2 === 'undefined') && (mode === 'relaxed')) {
          return [true, 'OK'];
        } else if ((typeof jsonToCheck1 === 'undefined') && (mode === 'relaxed')) {
          //return [false, pathArr[0]+' present in json 2 but not in json 1'];
          return [true, 'OK'];
        } else if ((typeof jsonToCheck2 === 'undefined') && (mode === 'relaxed')) {
          //return [false, pathArr[0]+' present in json 1 but not in json 2'];
          return [true, 'OK'];
        }
        restofpath1 = [];
        restofpath2 = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        const result = compareFieldsWithMap(restofpathstr1, restofpathstr2,
          jsonToCheck1, jsonToCheck2, fieldMap, mode, root1, root2);
        if (result[0]) {
          return [true, 'OK'];
        }
        return [false, result[1] + ''];
    }
  }
};
const findJson = function(parentJson, childJson, mode) {
  for (const field in childJson) {
    if (Object.prototype.toString.call(childJson[field]) === '[object Object]') {
      return findJson(parentJson[field], childJson[field], mode);
    }
    if (!find(parentJson, field, childJson[field], mode)) {
      return false;
    }
  }
  return true;
};
const findField = function(parentJson, fieldName) {
  if (typeof parentJson[fieldName] !== 'undefined') {
    return true;
  }
  return false;
};

function checkType(json, key, expectedType, mode) {
  let result = [];
  let found = false;
  for (const property in json) {
    if (json.hasOwnProperty(property)) {
      if (property === key && (typeof json[property] === expectedType.toLowerCase())) {
        found = true;
        return true;
      }
      if (isArray(json[property])) {
        if (typeof json[property][0] !== 'Object') {
          return (typeof json[property].toString() === expectedType.toLowerCase());
        }
        for (const child in json[property]) {
          const res = checkType(json[property][child], key, expectedType, mode);
          if (res) {
            return true;
          }
        }
      }
    }
  }
  if ((found === false) && ((mode === 'strict_null') || (mode === 'relaxed_null'))) {
    return true;
  } else if ((found === false) && (typeof json === 'undefined') &&
    ((mode === 'relaxed_null') || (mode === 'relaxed_notnull'))) {
    return true;
  }
  return false;
}
const findJsonTypes = function(path, jsonToCheck, inputJson, mode, root) {
  if ((path.indexOf('.') < 0) || (path === '.')) {
    const badNodeList = [];
    let count = 0;
    switch (path) {
      case '*':
        for (let i = 0; i < jsonToCheck.length; i++) {
          if (findJsonType(jsonToCheck[i], inputJson, mode)) {
            count++;
          } else {
            badNodeList.push(i);
          }
        }
        if (count === jsonToCheck.length) {
          return [true, 'OK'];
        }
        return [false, root + '(' + badNodeList + ')'];
      case '?':
        for (let i = 0; i < jsonToCheck.length; i++) {
          if (findJsonType(jsonToCheck[i], inputJson, mode)) {
            count++;
          }
        }
        if (count > 1) {
          return [true, 'OK'];
        }
        return [false, root + '(All)'];
      case '.':
        if (findJsonType(jsonToCheck, inputJson, mode)) {
          return [true, 'OK'];
        }
        return [false, ''];
      default:
        if (findJsonType(jsonToCheck[path], inputJson, mode)) {
          return [true, 'OK'];
        }
        return [false, ''];
    }
  } else {
    let restofpathstr;
    let restofpath = [];
    let pathArr = path.split('.');
    if ((pathArr[0] !== '*') && (pathArr[0] !== '?')) {
      root = pathArr[0];
    }
    let badNodeList = [];
    let count = 0;
    switch (pathArr[0]) {
      case '*':
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        for (let j = 0; j < jsonToCheck.length; j++) {
          const result = findJsonTypes(restofpathstr, jsonToCheck[j], inputJson, mode, root);
          if (!result[0]) {
            badNodeList.push(root + '[' + j + '] ' + result[1]);
          } else {
            count++;
          }
        }
        if (count === jsonToCheck.length) {
          return [true, 'OK'];
        }
        return [false, badNodeList];
      case '?':
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        for (let j = 0; j < jsonToCheck.length; j++) {
          const result = findJsonTypes(restofpathstr, jsonToCheck[j], inputJson, mode, root);
          if (result[0]) {
            count++;
          } else {
            badNodeList.push(root + '[' + j + '] ' + result[1]);
          }
        }
        if (count < 1) {
          return [false, badNodeList];
        }
        return [true, 'OK'];
      default:
        jsonToCheck = jsonToCheck[pathArr[0]];
        if ((typeof jsonToCheck === 'undefined') && ((mode === 'strict_notnull') || (mode === 'strict_null'))) {
          return [false, pathArr[0] + ' not present'];
        } else if ((typeof jsonToCheck === 'undefined') &&
          ((mode === 'relaxed_notnull') || (mode === 'relaxed_null'))) {
          return [true, 'OK'];
        }
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        const result = findJsonTypes(restofpathstr, jsonToCheck, inputJson, mode, root);
        if (result[0]) {
          return [true, 'OK'];
        }
        return [false, result[1] + ''];
    }
  }
};
const findJsonType = function(parentJson, childJson, mode) {
  for (const field in childJson) {
    if (Object.prototype.toString.call(childJson[field]) === '[object Object]') {
      return findJsonType(parentJson[field], childJson[field], mode);
    }
    if (!checkType(parentJson, field, childJson[field], mode)) {
      return false;
    }
  }
  return true;
};
const checkSort = function(path, jsonToCheck, sortType, mode, root, currValue) {
  if (path.indexOf('.') < 0) {
    const badNodeList = [];
    if ((Object.prototype.toString.call(jsonToCheck[path]) === '[object Object]') ||
      (Object.prototype.toString.call(jsonToCheck[path]) === '[object Array]')) {
      return [false, ''];
    }
    if ((typeof jsonToCheck[path] === 'undefined') && (mode === 'relaxed')) {
      return [true, currValue];
    }
    switch (sortType) {
      case 'ASC':
        if (Number(jsonToCheck[path]) >= Number(currValue)) {
          //console.log('true currValue '+currValue+ ' '+ jsonToCheck[path]+ ' '+(typeof jsonToCheck[path]));
          currValue = jsonToCheck[path];
        } else {
          //console.log('false currValue '+currValue+ ' '+ jsonToCheck[path]+ ' '+(typeof jsonToCheck[path]));
          return [false, ''];
        }
        break;
      case 'DESC':
        if (Number(jsonToCheck[path]) <= Number(currValue)) {
          currValue = jsonToCheck[path];
        } else {
          return [false, ''];
        }
        return [true, currValue];
      default:
    }
  } else {
    let restofpathstr;
    let restofpath = [];
    const pathArr = path.split('.');
    if ((pathArr[0] !== '*') && (pathArr[0] !== '?')) {
      root = pathArr[0];
    }
    const badNodeList = [];
    let count = 0;
    switch (pathArr[0]) {
      case '*':
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        for (let j = 0; j < jsonToCheck.length; j++) {
          const result = checkSort(restofpathstr, jsonToCheck[j], sortType, mode, root, currValue);
          if (!result[0]) {
            badNodeList.push(root + '[' + j + '] ' + result[1]);
          }
          count++;
          currValue = result[1];
        }
        if (count === jsonToCheck.length) {
          return [true, currValue];
        }
        return [false, badNodeList];
      default:
        jsonToCheck = jsonToCheck[pathArr[0]];
        if ((typeof jsonToCheck === 'undefined') && (mode === 'strict')) {
          return [false, pathArr[0] + ' not present'];
        } else if ((typeof jsonToCheck === 'undefined') && (mode === 'relaxed')) {
          return [true, currValue];
        }
        restofpath = [];
        for (let k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        const result = checkSort(restofpathstr, jsonToCheck, sortType, mode, root, currValue);
        currValue = result[1];
        if (result[0]) {
          return [true, currValue];
        }
        return [false, result[1] + ''];
    }
  }
};

module.exports = {
  findJsonTypes,
  findJson,
  find,
  findJsonValues,
  findJsonLength,
  findJsonField,
  findField,
  checkSort,
  compareFields,
  translateToFirstJson,
  checkDuplicates,
  compareFieldsWithMap,
};
