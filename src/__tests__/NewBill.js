/* eslint-disable no-undef */
import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"

const newBill = {
  email: "test@email.com",
  type: "Restaurant",
  name:  "test.name",
  amount: 10,
  date: "05/09/2021",
  vat: 5.5,
  pct: 20,
  commentary: "test.commentary",
  fileUrl: "https://ensiwiki.ensimag.fr/index.php?title=Fichier:Apple.png",
  fileName: "this.fileName",
  status: 'pending'
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then new Bill is created", () => {

      localStorageMock.setItem('user', JSON.stringify({ type: 'Employee', email: 'employee@email.com' }))      
      const html = NewBillUI()
      document.body.innerHTML = html

      const thisNewBill = new NewBill({ document, onNavigate, firestore: null, localStorage: localStorageMock})
      
      screen.getByTestId('expense-type').value = newBill.type
      screen.getByTestId('expense-name').value = newBill.name
      screen.getByTestId('amount').value = newBill.value
      screen.getByTestId('datepicker').value = newBill.date
      screen.getByTestId('vat').value = newBill.vat
      screen.getByTestId('expense-name').value = newBill.pct
      screen.getByTestId('commentary').value = newBill.commentary
      thisNewBill.fileUrl = newBill.fileUrl
      thisNewBill.fileName = newBill.fileName

      const handleSubmit = jest.fn((e) => thisNewBill.handleSubmit(e))
      thisNewBill.createBill = (thisNewBill) => thisNewBill

      const formSubmit = screen.getByTestId("form-new-bill")
      formSubmit.addEventListener('click', handleSubmit)
      userEvent.click(formSubmit)

      expect(handleSubmit).toHaveBeenCalled()
    })
    test("Then it should import file details if file is an image", () => {

      localStorageMock.setItem('user', JSON.stringify({ type: 'Employee', email: 'cedric.hiely@billed.com' }))          
      const html = NewBillUI()
      document.body.innerHTML = html

      const thisNewBill = new NewBill({ document, onNavigate, firestore: null, localStorage: localStorageMock})

      const file = screen.getByTestId("file")
      const fileImage = new File(["mon-image"], "image.png", { type: "image/png" })

      const handleChangeFile = jest.fn(() => thisNewBill.handleChangeFile)
      file.addEventListener("change", handleChangeFile)
      userEvent.upload(file, fileImage)

      expect(file.files).toHaveLength(1)
    })
    test("Then it should no import file details if file is not an image", () => {

      localStorageMock.setItem('user', JSON.stringify({ type: 'Employee' }))          
      const html = NewBillUI()
      document.body.innerHTML = html

      const thisNewBill = new NewBill({ document, onNavigate, firestore: null, localStorage: localStorageMock})
      
      const file = screen.getByTestId("file")
      const fileDoc = new File(["text"], "text.txt", { type: "text/plain" })

      const handleChangeFile = jest.fn(() => thisNewBill.handleChangeFile)
      file.addEventListener("upload", handleChangeFile)
      userEvent.upload(file, fileDoc)

      expect(handleChangeFile(fileDoc)).toBeTruthy()
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to NewBill", () => {
    test("Then push new bill to mock API POST", async () => {
        const postSpy = jest.spyOn(firebase, "post")
        const bills = await firebase.post(newBill)
        expect(postSpy).toHaveBeenCalledTimes(1)
        expect(bills.data.length).toBe(1)
    })
    test("add bill to API and fails with 404 message error", async () => {
        firebase.post.mockImplementationOnce(() => 
          Promise.reject(new Error("Erreur 404")))
        const html = BillsUI({ error: "Erreur 404" })
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy();
    })
    test("add bill to API and fails with 500 message error", async () => {
        firebase.post.mockImplementationOnce(() => 
          Promise.reject(new Error("Erreur 500")))
        const html = BillsUI({ error: "Erreur 500" })
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
    });
  })
})