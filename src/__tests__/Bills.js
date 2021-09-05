import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from '../containers/Bills.js'
import { ROUTES } from "../constants/routes"
import { bills } from "../fixtures/bills.js"
import firebase from "../__mocks__/firebase"
import { localStorageMock } from "../__mocks__/localStorage.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then It should renders NewBill page", () => {
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      const thisBill = new Bills({ document, onNavigate, firestore: null, bills, localStorage: window.localStorage})          
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      const handleClickNewBill = jest.fn((e) => thisBill.handleClickNewBill(e, bills)) 
      const buttonNewBill = screen.getByTestId(`btn-new-bill`)
      buttonNewBill.addEventListener('click', handleClickNewBill)
      userEvent.click(buttonNewBill)

      expect(handleClickNewBill).toHaveBeenCalled()
    })

    test("Then It should open Bill's modal", () => {
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee'}))
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      const handleClickIconEye = jest.fn(Bills.handleClickIconEye)
      const eye = screen.getAllByTestId('icon-eye')[0]
      eye.addEventListener('click', handleClickIconEye)
      userEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = screen.getByTestId('modaleFileEmployee')
      expect(modale).toBeTruthy()
    })

    test("Then modal contain an image", () => {
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      const thisBill = new Bills({ document, onNavigate, firestore: null, bills, localStorage: window.localStorage })          
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      $.fn.modal = jest.fn()
      const eye = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn(() => thisBill.handleClickIconEye(eye))
      eye.addEventListener('click', handleClickIconEye)
      userEvent.click(eye)
      const modale = screen.getByTestId('modal-body-show')
      expect(modale).toBeTruthy()
      /*const handleClickIconEye = jest.fn(Bills.handleClickIconEye)
      const eye = screen.getAllByTestId('icon-eye')[0]
      eye.addEventListener('click', handleClickIconEye)
      userEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()*/
    })
  })

  describe('When I am on Bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      const html = BillsUI({ error: 'some error message' })
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bill", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})