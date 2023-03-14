'use strict';

const fs = require('fs');
const readline = require('readline');
const path = require('path');

/*
 * Copyright (c) 2023, Tangent65536.
 *  All rights reserved.
 */
function decode(enc)
{
  /*
   * Please check the `misc` folder for the dump of
   *  .NET CIL bytecode.
   */

  let ret = {};
  let key = enc.readInt32LE();

  let ptr = 4;
  while(ptr < enc.length)
  {
    let jdx = ptr ^ key;

    let data = enc.subarray(ptr);
    let buf = Buffer.allocUnsafe(data.readInt32LE());
    data.copy(buf, 0, 8, 8 + buf.length);

    let i = 0, j = buf.length - 1;
    while(i < j)
    {
      buf[i] ^= buf[j];
      buf[j] ^= buf[i] ^ data[4];
      buf[i] ^= buf[j];

      i++;
      j--;
    }

    if(buf.length & 0x1)
    {
      buf[buf.length >> 1] ^= data[4];
    }

    ret[jdx] = buf.toString('utf8');
    ptr += buf.length + 8;
  }

  return ret;
}

function __main__(args)
{
  if(args.length <= 0)
  {
    console.log('%s', `Usage: node ${path.basename(__filename)} <data_path>`);
    return;
  }

  let decoded = decode(fs.readFileSync(args[0]));
  fs.writeFileSync('strings.json', JSON.stringify(decoded, null, 1));
  console.log('Done!');
}

if(require.main === module)
{
  __main__(process.argv.slice(2));
}