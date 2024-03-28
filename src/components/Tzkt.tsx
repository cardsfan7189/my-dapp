import {headGet} from "@tzkt/sdk-api";

async function getCycle() {
   return await headGet()
}

console.log(getCycle())

