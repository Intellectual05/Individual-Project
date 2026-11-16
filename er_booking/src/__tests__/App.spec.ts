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
})
