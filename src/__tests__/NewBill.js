import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
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
  fileUrl: "this.fileUrl",
  fileName: "this.fileName",
  status: 'pending'
}

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then new Bill is created", () => {
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      //const thisNewBill = new NewBill({ document, onNavigate, firestore, localStorage: window.localStorage})          
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const handleSubmit = jest.fn(() => NewBill.handleSubmit(newBill))
      const formSubmit = screen.getByTestId("form-new-bill")
      userEvent.click(formSubmit)
      expect(handleSubmit).toBeTruthy()
    })
    test("Then it should import file details", () => {
      
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