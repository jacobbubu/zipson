import { ARRAY_END_TOKEN, OBJECT_END_TOKEN, ERROR_TOKEN_END } from '../constants';
import { Cursor, OrderedIndex, SKIP_SCALAR, TargetType } from './common';
import { decompressScalar } from './scalar';
import { appendTemplateObjectElementsValue, appendTemplateObjectPropertiesValue } from './template';

export function decompressElement(c: string, cursor: Cursor, data: string, orderedIndex: OrderedIndex): boolean {
  let targetValue: any;

  if(c === ARRAY_END_TOKEN || c === OBJECT_END_TOKEN || c === ERROR_TOKEN_END) {
    targetValue = cursor.currentTarget.value;
    cursor.currentTarget = cursor.stack[cursor.pointer - 1];
    cursor.pointer--;
  } else {
    targetValue = decompressScalar(c, data, cursor, orderedIndex);
    if(targetValue === SKIP_SCALAR) { return false; }
  }

  if(cursor.currentTarget.type === TargetType.ERROR) {
    cursor.currentTarget.value = new Error(targetValue);
  } else if(cursor.currentTarget.type === TargetType.SCALAR) {
    cursor.currentTarget.value = targetValue;
  } else if(cursor.currentTarget.type === TargetType.ARRAY) {
    cursor.currentTarget.value[cursor.currentTarget.value.length] = targetValue;
  } else if(cursor.currentTarget.type === TargetType.OBJECT) {
    if(cursor.currentTarget.key != null) {
      cursor.currentTarget.value[cursor.currentTarget.key] = targetValue;
      cursor.currentTarget.key = void 0;
    } else {
      cursor.currentTarget.key = targetValue;
    }
  } else if(cursor.currentTarget.type === TargetType.TEMPLATE_OBJECT) {
    cursor.currentTarget.currentToken = targetValue;
    cursor.currentTarget.currentTokens.push(targetValue);
  } else if(cursor.currentTarget.type === TargetType.TEMPLATE_OBJECT_PROPERTIES) {
    appendTemplateObjectPropertiesValue(cursor.currentTarget, targetValue);
  } else if(cursor.currentTarget.type === TargetType.TEMPLATE_OBJECT_ELEMENTS) {
    appendTemplateObjectElementsValue(cursor.currentTarget, targetValue);
  }

  return true;
}
