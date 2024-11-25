import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Image } from 'react-native';
import styles from '../styles/QuizzCourseStyles'; 
import BASE_URL from './apiConfig';
const CustomAlert = ({ visible, onClose, score, scoreType, userID, testId }) => {
  // Gọi API khi modal đóng lại
  const submitScore = async () => {
    console.log('Gửi dữ liệu:', { userID, testId, score });


    try {
      const response = await fetch(`${BASE_URL}/score/addScore'`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: userID,
          testID: testId,
          score: score,
        }),
      });

      // Log phản hồi từ server
      if (response.ok) {
        const responseData = await response.json();
     
        console.log('Gửi điểm thành công ,API trả về:', responseData);
      } else {
        console.error('Có lỗi khi gửi điểm số:', response.statusText);
      }
    } catch (error) {
      console.error('Lỗi kết nối đến API:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      // Gọi API khi modal xuất hiện
      submitScore();
    }
  }, [visible]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Image
            source={require('../design/image/chucmung.png')}
            style={styles.modalImage}
          />
          <Text style={styles.modalHeaderText}>Xin chúc mừng</Text>
          <Text style={styles.modalSubText}>
            Chúc mừng bạn đã hoàn thành bài kiểm tra
          </Text>
          <Text style={styles.modalText}>{score} điểm</Text> 
          <Text style={styles.modalFooterText}>{scoreType}</Text>

          <TouchableOpacity
            onPress={onClose}
            style={styles.continueButtonDone}>
            <Text style={styles.continueButtonTextDone}>Tiếp theo</Text>
            <Image
              source={require('../design/image/icon_continue.png')}
              style={styles.continueButtonImage}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
