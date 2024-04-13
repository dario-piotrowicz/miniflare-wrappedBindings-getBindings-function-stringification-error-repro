import { Miniflare } from "miniflare";

const mf = new Miniflare({
  workers: [
    {
      wrappedBindings: {
        Greeter: {
          scriptName: "impl",
        },
      },
      modules: true,
      script: `
        export default {
          fetch(req, env){
            return new Response(env.Greeter.sayHello('Miniflare'));
          }
        }
      `,
    },
    {
      modules: true,
      name: "impl",
      script: `
        export default function (env) {
          return {
            sayHello(name) {
              return "Hello " + name;
            }
          }
        }
      `,
    },
  ],
});

const resp = await mf.dispatchFetch("http://localhost");

const text = await resp.text();

console.log(`Response from Miniflare: "${text}"\n`);

try {
  const { Greeter } = await mf.getBindings();
  console.log(Greeter.sayHello('world'));
} catch (e) {
  console.error(`❌ Calling Greeter.sayHello throws with "${e.message}"`);
}

console.log('');
await mf.dispose();
