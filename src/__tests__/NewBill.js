import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"
import Firestore from "../app/Firestore.js"
jest.mock("../app/Firestore.js");

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

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then new Bill is created", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'employee@email.com' }))      
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      const thisNewBill = new NewBill({ document, onNavigate, firestore: null, localStorage: window.localStorage})
      
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
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'cedric.hiely@billed.com' }))          
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      const thisNewBill = new NewBill({ document, onNavigate, firestore: Firestore, localStorage: window.localStorage})

      const file = screen.getByTestId("file")
      const fileImage = new File(["mon-image"], "image.png", { type: "image/png" })

      const handleChangeFile = jest.fn(() => thisNewBill.handleChangeFile)
      file.addEventListener("change", handleChangeFile)
      userEvent.upload(file, fileImage)
      expect(file.files).toHaveLength(1)
    })
    test("Then it should no import file details if file is not an image", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))          
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      const thisNewBill = new NewBill({ document, onNavigate, firestore: Firestore, localStorage: window.localStorage})
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
  })
})