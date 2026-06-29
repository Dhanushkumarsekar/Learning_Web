from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from lms_backend.models import Course, Category

User = get_user_model()

class Command(BaseCommand):
    help = 'Add sample courses to the system'

    def handle(self, *args, **options):
        # Get or create categories
        categories_data = {
            'Full Stack': 'Learn full-stack web development with modern frameworks',
            'Flutter': 'Master mobile app development with Flutter',
            'Cloud Compute': 'Learn cloud computing and deployment',
            'Data Analysis': 'Master data analysis and visualization techniques',
        }
        
        categories = {}
        for cat_name, cat_desc in categories_data.items():
            category, created = Category.objects.get_or_create(
                name=cat_name,
                
                defaults={'description': cat_desc}

            )


            categories[cat_name] = category

            if created:

                self.stdout.write(self.style.SUCCESS(f'Created category: {cat_name}'))
            else:
                self.stdout.write(f'Category already exists: {cat_name}')

        # Get or create default admin user
        admin_user = User.objects.filter(user_type='ADMIN').first()
        if not admin_user:
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@lms.com',
                password='admin123',
                user_type='ADMIN',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(self.style.SUCCESS('Created default admin user'))

        # Define courses
        courses_data = [
            {
                'title': 'Full Stack Development',
                'description': 'Learn to build complete web applications using modern technologies including HTML, CSS, JavaScript, React, Node.js, and databases. Master both frontend and backend development.',
                'category': 'Full Stack'
            },
            {
                'title': 'Flutter Development',
                'description': 'Build beautiful, natively compiled applications for mobile, web, and desktop from a single codebase. Learn Dart programming and Flutter framework fundamentals.',
                'category': 'Flutter'
            },
            {
                'title': 'Cloud Computing Fundamentals',
                'description': 'Understand cloud computing concepts, AWS, Azure, and Google Cloud Platform. Learn about deployment, scaling, and cloud infrastructure management.',
                'category': 'Cloud Compute'
            },
            {
                'title': 'Data Analysis & Visualization',
                'description': 'Master data analysis techniques using Python, Pandas, NumPy, and Matplotlib. Learn data visualization and insights extraction from complex datasets.',
                'category': 'Data Analysis'
            },
        ]

        # Create courses
        for course_data in courses_data:
            course, created = Course.objects.get_or_create(
                title=course_data['title'],
                defaults={
                    'description': course_data['description'],
                    'created_by': admin_user,
                    'is_active': True,
                    'enable_quizzes': True,
                    'credit_points': 20,
                }
            )
            
            # Add category to course
            category = categories[course_data['category']]
            course.category.add(category)
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created course: {course_data["title"]}'))
            else:
                self.stdout.write(f'Course already exists: {course_data["title"]}')

        self.stdout.write(self.style.SUCCESS('\nAll courses have been added successfully!'))
