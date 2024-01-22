import {DOMParser} from "linkedom"

console.log((new DOMParser).parseFromString(`<test hidden=""></test>`,"text/xml").toString());
console.log((new DOMParser).parseFromString(`<test hidden=""></test>`,"text/html").toString());