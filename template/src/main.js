import ReactDOM from 'react-dom';
import React from 'react';
import { invokeScript, broadcast } from '@waves/waves-transactions';
import wc from '@waves/waves-crypto';
import sha256 from 'js-sha256'
import './components/app';

console.log(ReactDOM);
console.log(React);
console.log(invokeScript);
console.log(broadcast);
console.log(sha256);
console.log(wc);
window.sha256 = sha256;
window.wc = wc;