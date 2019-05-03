import ReactDOM from 'react-dom';
import React from 'react';
import { invokeScript, broadcast } from '@waves/waves-transactions';
import {stringToUint8Array, sha256, base58encode} from '@waves/waves-crypto';
import './components/app';

console.log(ReactDOM);
console.log(React);
console.log(invokeScript);
console.log(broadcast);
window.wc = {
    "stringToUint8Array": stringToUint8Array,
    "sha256": sha256,
    "base58encode": base58encode
};
console.log(window.wc);