import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestGemukoree(unittest.TestCase):

    def setUp(self):
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service)
        self.driver.get('https://gemukoree.netlify.app/login')  

    def test_login(self):
        driver = self.driver

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, 'email')))
        
        # Encuentra los campos de entrada de usuario y contraseña
        email_input = driver.find_element(By.ID, 'email')  
        password_input = driver.find_element(By.ID, 'password')

        email_input.send_keys('paula@gmail.com')
        password_input.send_keys('19802013')

        login_button = driver.find_element(By.CLASS_NAME, 'login-button')
        login_button.click()

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, 'home-title')))
        
        self.assertIn("Gemukore", driver.title)  

    def tearDown(self):
        self.driver.quit()

if __name__ == '__main__':
    unittest.main()
