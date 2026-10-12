import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import TopicNavigator from '../src/components/TopicNavigator.vue'

const topics = ['01_自然地理', '02_植物研究', '03_动物保护']
let wrapper: ReturnType<typeof mount> | undefined
function setup() {
  wrapper = mount(defineComponent({
    components: { TopicNavigator },
    setup() { return { topics, selected: ref(topics[0]) } },
    template: `<TopicNavigator v-model="selected" :topics="topics" />
      <input id="search" type="search"><input id="spelling" type="text">
      <input id="mastered" type="checkbox"><textarea id="note"></textarea>
      <div id="editor" contenteditable="true"></div>
      <div class="fixed-audio-player"><button id="audio">播放</button></div>
      <output>{{ selected }}</output>`,
  }), { attachTo: document.body })
  return wrapper
}
async function key(element: Element, name: string, options: KeyboardEventInit = {}) {
  element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...options }))
  await nextTick()
}
async function jump(w: ReturnType<typeof setup>, value: string) {
  await w.get('input[aria-label="话题编号"]').setValue(value)
  await w.get('form').trigger('submit')
  await nextTick()
}
afterEach(() => { wrapper?.unmount(); document.body.innerHTML = '' })

describe('topic navigation', () => {
  it('keeps original topic names while jumping with unpadded numbers', async () => {
    const w = setup()
    expect(w.findAll('option').map(option => option.text())).toEqual(topics)
    await jump(w, '2')
    expect(w.get('output').text()).toBe('02_植物研究')
    expect((w.get('input[aria-label="话题编号"]').element as HTMLInputElement).value).toBe('2')
    await w.get('select').setValue(topics[2])
    expect(w.get('output').text()).toBe(topics[2])
  })

  it('rejects invalid numbers without changing the selected topic', async () => {
    const w = setup()
    for (const value of ['0', '4', '1.5', 'abc', '']) {
      await jump(w, value)
      expect(w.get('output').text()).toBe(topics[0])
      expect(w.get('[role="alert"]').text()).toContain('1–3')
    }
    await jump(w, '03')
    expect(w.get('output').text()).toBe(topics[2])
    expect((w.get('input[aria-label="话题编号"]').element as HTMLInputElement).value).toBe('3')
    expect(w.find('[role="alert"]').exists()).toBe(false)
  })

  it('switches using arrow keys or buttons and stops at the first and last topics', async () => {
    const w = setup()
    expect((w.get('button[aria-label="上一话题"]').element as HTMLButtonElement).disabled).toBe(true)
    await key(document.body, 'ArrowLeft')
    expect(w.get('output').text()).toBe(topics[0])
    await key(document.body, 'ArrowRight')
    expect(w.get('output').text()).toBe(topics[1])
    await w.get('button[aria-label="下一话题"]').trigger('click')
    expect(w.get('output').text()).toBe(topics[2])
    expect((w.get('button[aria-label="下一话题"]').element as HTMLButtonElement).disabled).toBe(true)
    await key(document.body, 'ArrowRight')
    expect(w.get('output').text()).toBe(topics[2])
    await w.get('button[aria-label="上一话题"]').trigger('click')
    expect(w.get('output').text()).toBe(topics[1])
  })

  it('leaves text editing, topic input, dropdown and audio controls in control of their own keys', async () => {
    const w = setup()
    for (const selector of ['#search', '#spelling', '#note', '#editor', '#audio', 'select', 'input[aria-label="话题编号"]']) {
      await key(w.get(selector).element, 'ArrowRight')
      expect(w.get('output').text()).toBe(topics[0])
    }
    await key(w.get('#mastered').element, 'ArrowRight')
    expect(w.get('output').text()).toBe(topics[1])
  })

  it('preserves browser shortcuts and key repeat while allowing arrows immediately after numeric jump', async () => {
    const w = setup()
    for (const options of [{altKey:true}, {ctrlKey:true}, {metaKey:true}, {shiftKey:true}, {repeat:true}, {isComposing:true}]) {
      await key(document.body, 'ArrowRight', options)
      expect(w.get('output').text()).toBe(topics[0])
    }
    const input = w.get('input[aria-label="话题编号"]').element as HTMLInputElement
    input.focus()
    await jump(w, '2')
    expect(document.activeElement).not.toBe(input)
    await key(document.body, 'ArrowRight')
    expect(w.get('output').text()).toBe(topics[2])
  })
})
