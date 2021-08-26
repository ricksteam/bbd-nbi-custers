async function* makeTextFileLineIterator(fileURL)
{
  const utf8Decoder = new TextDecoder('utf-8');
  const response = await fetch(fileURL);
  const reader = response.body.getReader();
  let { value: chunk, done: readerDone } = await reader.read();
  chunk = chunk ? utf8Decoder.decode(chunk) : '';
  
  const re = /\n|\r|\r\n/gm;
  let startIndex = 0;
  let result;
    
  for (;;) {
    let result = re.exec(chunk);
    if (!result) {
      if (readerDone) {
        break;
      }
      let remainder = chunk.substr(startIndex);
      ({ value: chunk, done: readerDone } = await reader.read());
      chunk = remainder + (chunk ? utf8Decoder.decode(chunk) : '');
      startIndex = re.lastIndex = 0;
      continue;
    }
    yield chunk.substring(startIndex, result.index);
    startIndex = re.lastIndex;
  }
  if (startIndex < chunk.length) {
    // last line didn't end in a newline char
    yield chunk.substr(startIndex);
  }
}

async function readFile(file)
{
  // var test = {
  //   x: [0, .5, 1],
  //   y: [0, .5, 1],
  //   z: [0, .5, 1],
  //   mode: 'markers',
  //   marker: {
  //     color: 'red',
  //     size: [Math.log(1000+100), Math.log(1000+200), Math.log(1000+400)],
  //     symbol: 'circle',
  //   },
  //   name: 'test',
  //   type: 'scatter3d'
  // };

  // var placeHolder = {
  //   x: [.7],
  //   y: [.7],
  //   z: [.7],
  //   mode: 'markers',
  //   marker: {
  //     color: ['blue'],
  //     size: [Math.log(1000+700)],
  //     symbol: 'circle',
  //   },
  //   name: 'data',
  //   type: 'scatter3d'
  // };

  var layout = {
    title: '3D Bridge Data Scatter Plot',
    scene: {
		  xaxis:{title: 'subNumInt'},
		  yaxis:{title: 'deckNumInt'},
		  zaxis:{title: 'supNumInt'},
		},
    autosize: true,
    width: 750,
    height: 500,
    margin: {
      l: 50,
      r: 0,
      b: 0,
      t: 65
    }
  };
  
  //var data = [test];
  
  var data = [];
  
//  Plotly.newPlot('tester', data, layout, {displaylogo: false}, {editable: true});

  let map = {};
  let wordList = [];
  var i = 0;
  for await (let line of makeTextFileLineIterator(file))
  {
    let words = line.split(" ");
    if(words[0] == "")
    {
      continue;
    }
    if(!map[words[0]])
    {
      map[words[0]] = [];
      wordList[i] = words[0];
      
      // console.log(wordList[i]);
      // console.log("worked first");
      
      i++;
    }
    // if(wordList[i] != words[0] && line != null)
    // {
    //   console.log(wordList[i-1]);
    //   console.log(words[0]);
    //   console.log(map[words[0]]);
    //   console.log(i);
    //   console.log("worked second");
    // }
    if(words != null)
    {
      map[words[0]].push({x:words[1], y:words[2], z:words[3], size:words[4], name:words[0]});
      
      // placeHolder.x.push(words[1]);
      // placeHolder.y.push(words[2]);
      // placeHolder.z.push(words[3]);
      // placeHolder.marker.size.push(Math.log(1000+words[4]));
      // switch(words[0])
      // {
      //   case 'nebraska': placeHolder.marker.color.push('orange'); break;
      //   case 'kansas': placeHolder.marker.color.push('green'); break;
      //   case 'indiana': placeHolder.marker.color.push('blue'); break;
      //   case 'illinois': placeHolder.marker.color.push('violet'); break;
      //   case 'ohio': placeHolder.marker.color.push('brown'); break;
      //   case 'wisconsin': placeHolder.marker.color.push('black'); break;
      //   case 'missouri': placeHolder.marker.color.push('red'); break;
      //   case 'minnesota': placeHolder.marker.color.push('pink'); break;
      //   default: placeHolder.marker.color.push('yellow'); break;
      // }
    }
  }
  // test.x.push(.4);
  // test.y.push(.4);
  // test.z.push(.4);
  // test.marker.size.push(Math.log(1000+400));
  
  addData(map, wordList, i, data)
  
  // data.push(placeHolder);
  
  Plotly.newPlot('tester', data, layout, {displaylogo: false}, {editable: true});
  
  // console.log(data);
  // console.log(map);
  // console.log(wordList);

}

function createData(name)
{
  var k = 0;
  var info = {
    name: name[0].name,
    x: [0],
    y: [0],
    z: [0],
    mode: 'markers',
    marker: {
      color: '',
      size: [0],
      symbol: 'circle',
    },
    type: 'scatter3d'
  };
  for(k = 0; k < name.length; k++)
  {
    info.x.push(name[k].x);
    info.y.push(name[k].y);
    info.z.push(name[k].z);
    info.marker.size.push(Math.log(1000+name[k].size));
    switch(name[0].name)
    {
      case 'nebraska': info.marker.color = 'orange'; break;
      case 'kansas': info.marker.color = 'green'; break;
      case 'indiana': info.marker.color = 'blue'; break;
      case 'illinois': info.marker.color = 'violet'; break;
      case 'ohio': info.marker.color = 'brown'; break;
      case 'wisconsin': info.marker.color = 'black'; break;
      case 'missouri': info.marker.color = 'red'; break;
      case 'minnesota': info.marker.color = 'pink'; break;
      default: info.marker.color = 'yellow'; break;
    }
  }
  return info;
}

function addData(map, wordList, i, data)
{
  while(i != 0)
  {
    info = createData(map[wordList[i-1]]);
    data.push(info);
    i--;
  }
}