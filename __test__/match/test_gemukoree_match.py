import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestGemukoreeMatch(unittest.TestCase):

    def setUp(self):
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service)
        self.driver.get('https://gemukoree.netlify.app/login')  

    def test_login_and_navigate_to_match(self):
        driver = self.driver

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, 'email')))
        
        email_input = driver.find_element(By.ID, 'email')  
        password_input = driver.find_element(By.ID, 'password')

        email_input.send_keys('paula@gmail.com')
        password_input.send_keys('19802013')

        login_button = driver.find_element(By.CLASS_NAME, 'login-button')
        login_button.click()

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, 'home-title')))

        match_link = driver.find_element(By.LINK_TEXT, 'GemuFusion') 
        match_link.click()

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, 'match-title')))

        profile_header = driver.find_element(By.CLASS_NAME, 'profile-header')
        self.assertTrue(profile_header.is_displayed(), "El perfil no está visible")

        profile_name = driver.find_element(By.CLASS_NAME, 'profile-info').find_element(By.TAG_NAME, 'h3')
        self.assertEqual(profile_name.text, 'Thomas', "El nombre del perfil no es correcto")

        profile_description = driver.find_element(By.CLASS_NAME, 'profile-info').find_element(By.TAG_NAME, 'p')
        self.assertEqual(profile_description.text, 'hola hola hola hola hola hola', "La descripción del perfil no es correcta")

        profile_image = driver.find_element(By.CLASS_NAME, 'profile-img')
        self.assertTrue(profile_image.is_displayed(), "La imagen del perfil no está visible")

        game_preferences = driver.find_element(By.CLASS_NAME, 'game-preferences')
        self.assertTrue(game_preferences.is_displayed(), "Las preferencias de juego no están visibles")

        WebDriverWait(driver, 15).until(EC.presence_of_all_elements_located((By.CLASS_NAME, 'game-item')))

        game_list = driver.find_elements(By.CLASS_NAME, 'game-item')
        self.assertGreater(len(game_list), 0, "No hay juegos en las preferencias de juego")

    def tearDown(self):
        self.driver.quit()

if __name__ == '__main__':
    unittest.main()
