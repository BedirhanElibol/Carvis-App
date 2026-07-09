async function fetchOpetPrices(provinceCode: string) {
  await new Promise(r => setTimeout(r, 1000));
  return null;
}

async function fetchPOPrices(provinceCode: string) {
  await new Promise(r => setTimeout(r, 1000));
  return [{ name: "Kurşunsuz 95 (Benzin)", price: 64.76 }];
}

async function runSequential() {
  const sources = [
    { name: "opet", fn: () => fetchOpetPrices("34") },
    { name: "petrolofisi", fn: () => fetchPOPrices("34") }
  ];

  for (const source of sources) {
    const results = await source.fn();
    if (results) {
      return { source: source.name, results };
    }
  }
}

async function runConcurrent() {
  const sources = [
    { name: "opet", fn: () => fetchOpetPrices("34") },
    { name: "petrolofisi", fn: () => fetchPOPrices("34") }
  ];

  const resultsList = await Promise.all(sources.map(s => s.fn()));
  for (let i = 0; i < sources.length; i++) {
    const results = resultsList[i];
    if (results) {
      return { source: sources[i].name, results };
    }
  }
}

async function main() {
  console.time("Sequential");
  await runSequential();
  console.timeEnd("Sequential");

  console.time("Concurrent");
  await runConcurrent();
  console.timeEnd("Concurrent");
}

main();
