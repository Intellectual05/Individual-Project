import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders the staff sign-in screen when no staff is signed in', () => {
    localStorage.removeItem('mediflow_staff')
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('MediFlow ER')
    expect(wrapper.text()).toContain('Hospital Staff Sign-In')
  })

  it('switches to staff registration mode from the sign-in screen', async () => {
    localStorage.removeItem('mediflow_staff')
    const wrapper = mount(App)
    const toggle = wrapper.find('.mode-link')
    expect(toggle.exists()).toBe(true)
    await toggle.trigger('click')
    expect(wrapper.text()).toContain('Hospital Staff Registration')
    expect(wrapper.text()).toContain('Create Staff Account')
  })
})
